"""
Resume Service - Handle resume uploads and parsing
"""
from typing import Optional, Dict, List
import logging
import os
from pathlib import Path
from datetime import datetime, timezone
import uuid

from llm import LLMService

logger = logging.getLogger(__name__)


class ResumeService:
    """Service for resume upload and parsing"""
    
    UPLOAD_DIR = Path(__file__).parent.parent / "storage" / "resumes"
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    def __init__(self, db, llm_service: Optional[LLMService] = None):
        self.db = db
        self.llm = llm_service
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    async def upload_resume(
        self,
        user_id: str,
        file_content: bytes,
        filename: str
    ) -> Dict:
        """Upload and save a resume file"""
        # Validate file extension
        ext = Path(filename).suffix.lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise ValueError(f"File type not allowed. Allowed: {', '.join(self.ALLOWED_EXTENSIONS)}")
        
        # Validate file size
        if len(file_content) > self.MAX_FILE_SIZE:
            raise ValueError(f"File too large. Maximum size: {self.MAX_FILE_SIZE / 1024 / 1024}MB")
        
        # Generate unique filename
        resume_id = f"resume_{uuid.uuid4().hex[:12]}"
        safe_filename = f"{resume_id}{ext}"
        file_path = self.UPLOAD_DIR / safe_filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        now = datetime.now(timezone.utc)
        
        # Save resume record
        resume_doc = {
            "resume_id": resume_id,
            "user_id": user_id,
            "filename": filename,
            "stored_filename": safe_filename,
            "file_size": len(file_content),
            "file_type": ext,
            "parsed": False,
            "parsed_data": None,
            "uploaded_at": now.isoformat()
        }
        
        await self.db.resumes.insert_one(resume_doc)
        
        # Update user profile with resume
        await self.db.engineer_profiles.update_one(
            {"user_id": user_id},
            {"$set": {
                "resume_url": f"/api/resumes/{resume_id}",
                "updated_at": now.isoformat()
            }}
        )
        
        return {
            "resume_id": resume_id,
            "filename": filename,
            "url": f"/api/resumes/{resume_id}"
        }
    
    async def parse_resume(self, resume_id: str) -> Dict:
        """Parse resume and extract structured data"""
        resume = await self.db.resumes.find_one({"resume_id": resume_id})
        if not resume:
            raise ValueError("Resume not found")
        
        # Read file content
        file_path = self.UPLOAD_DIR / resume["stored_filename"]
        if not file_path.exists():
            raise ValueError("Resume file not found")
        
        # Extract text based on file type
        text_content = await self._extract_text(file_path, resume["file_type"])
        
        # Parse using LLM or rule-based
        if self.llm:
            parsed_data = await self._ai_parse_resume(text_content)
        else:
            parsed_data = self._rule_based_parse(text_content)
        
        # Update resume record
        await self.db.resumes.update_one(
            {"resume_id": resume_id},
            {"$set": {
                "parsed": True,
                "parsed_data": parsed_data,
                "parsed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return parsed_data
    
    async def _extract_text(self, file_path: Path, file_type: str) -> str:
        """Extract text content from resume file"""
        if file_type == ".txt":
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        
        if file_type == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(str(file_path))
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
            except ImportError:
                logger.warning("pypdf not installed, cannot parse PDF")
                return ""
        
        if file_type in [".docx", ".doc"]:
            try:
                import docx
                doc = docx.Document(str(file_path))
                return "\n".join([para.text for para in doc.paragraphs])
            except ImportError:
                logger.warning("python-docx not installed, cannot parse DOCX")
                return ""
        
        return ""
    
    def _rule_based_parse(self, text: str) -> Dict:
        """Rule-based resume parsing"""
        lines = text.split("\n")
        
        # Simple extraction
        skills = []
        experience = []
        education = []
        
        # Common skill keywords to look for
        skill_keywords = [
            "python", "javascript", "typescript", "react", "node", "java",
            "c++", "c#", "go", "rust", "sql", "mongodb", "postgresql",
            "aws", "docker", "kubernetes", "git", "agile", "scrum"
        ]
        
        text_lower = text.lower()
        for skill in skill_keywords:
            if skill in text_lower:
                skills.append(skill.capitalize() if len(skill) <= 3 else skill.title())
        
        return {
            "skills": list(set(skills)),
            "experience": experience,
            "education": education,
            "raw_text": text[:5000]  # Store first 5000 chars
        }
    
    async def _ai_parse_resume(self, text: str) -> Dict:
        """AI-powered resume parsing"""
        prompt = f"""
        Parse this resume and extract structured data.
        
        RESUME TEXT:
        {text[:4000]}
        
        Return a JSON object with:
        - skills: array of technical skills
        - experience: array of {{company, title, start_date, end_date, description}}
        - education: array of {{institution, degree, field, year}}
        - headline: a professional headline/title
        - years_of_experience: estimated total years
        
        Return ONLY valid JSON.
        """
        
        try:
            response = await self.llm.generate(prompt, max_tokens=1000)
            import json
            return json.loads(response)
        except Exception as e:
            logger.error(f"AI resume parsing failed: {e}")
            return self._rule_based_parse(text)
    
    async def get_resume(self, resume_id: str) -> Optional[Dict]:
        """Get resume by ID"""
        return await self.db.resumes.find_one(
            {"resume_id": resume_id},
            {"_id": 0}
        )
    
    async def get_resume_file_path(self, resume_id: str) -> Optional[Path]:
        """Get the file path for a resume"""
        resume = await self.db.resumes.find_one({"resume_id": resume_id})
        if not resume:
            return None
        
        file_path = self.UPLOAD_DIR / resume["stored_filename"]
        if file_path.exists():
            return file_path
        return None
