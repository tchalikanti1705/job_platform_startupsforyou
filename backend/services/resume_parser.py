"""
Rule-based resume parser - MVP-1
Structured for easy AI integration in Phase 2
"""
import re
from typing import Optional, List
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Common skill keywords to look for
COMMON_SKILLS = [
    "python", "javascript", "typescript", "react", "vue", "angular", "node.js", "nodejs",
    "java", "c++", "c#", "go", "golang", "rust", "ruby", "php", "swift", "kotlin",
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "jenkins", "ci/cd",
    "git", "linux", "bash", "rest api", "graphql", "microservices",
    "machine learning", "ml", "ai", "deep learning", "tensorflow", "pytorch",
    "data analysis", "pandas", "numpy", "data science", "statistics",
    "html", "css", "sass", "tailwind", "bootstrap",
    "agile", "scrum", "jira", "product management", "project management",
    "figma", "sketch", "ui/ux", "design", "photoshop",
    "communication", "leadership", "problem solving", "teamwork",
    "excel", "powerpoint", "word", "google analytics",
    "fastapi", "django", "flask", "express", "spring boot",
    "nextjs", "next.js", "gatsby", "webpack", "vite"
]

# Email regex
EMAIL_PATTERN = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')

# Phone regex (various formats)
PHONE_PATTERN = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')

# Education keywords
EDUCATION_KEYWORDS = [
    "university", "college", "institute", "school", "bachelor", "master", 
    "phd", "degree", "diploma", "b.s.", "b.a.", "m.s.", "m.a.", "mba", "bs", "ba", "ms", "ma"
]

# Experience section keywords
EXPERIENCE_KEYWORDS = [
    "experience", "work history", "employment", "professional experience",
    "work experience", "career history"
]


class ResumeParser:
    """
    Rule-based resume parser
    
    Future AI integration point:
    - Replace parse_text() with AI-powered extraction
    - Keep the same return format (ParsedResumeData)
    """
    
    def __init__(self, ai_client=None):
        """
        Initialize parser with optional AI client for Phase 2
        """
        self.ai_client = ai_client  # For future AI integration
    
    def parse_pdf(self, filepath: str) -> dict:
        """
        Parse PDF file and extract information
        Returns dict matching ParsedResume model
        """
        try:
            text = self._extract_text_from_pdf(filepath)
            if not text:
                return {"error": "Could not extract text from PDF"}
            
            return self.parse_text(text)
        except Exception as e:
            logger.error(f"Error parsing PDF: {e}")
            return {"error": str(e)}
    
    def _extract_text_from_pdf(self, filepath: str) -> Optional[str]:
        """Extract text from PDF using pdfplumber or fallback to PyMuPDF"""
        text = ""
        
        # Try pdfplumber first
        try:
            import pdfplumber
            with pdfplumber.open(filepath) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            if text.strip():
                return text
        except ImportError:
            logger.warning("pdfplumber not installed, trying PyMuPDF")
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}")
        
        # Fallback to PyMuPDF
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(filepath)
            for page in doc:
                text += page.get_text() + "\n"
            doc.close()
            if text.strip():
                return text
        except ImportError:
            logger.warning("PyMuPDF not installed")
        except Exception as e:
            logger.warning(f"PyMuPDF failed: {e}")
        
        return text if text.strip() else None
    
    def parse_text(self, text: str) -> dict:
        """
        Parse resume text and extract structured information
        
        AI Integration Point: Replace this method's logic with:
        ```
        if self.ai_client:
            return self._ai_parse(text)
        ```
        """
        result = {
            "name": None,
            "email": None,
            "phone": None,
            "skills": [],
            "education": [],
            "experience": [],
            "summary": None
        }
        
        lines = text.split('\n')
        text_lower = text.lower()
        
        # Extract email
        email_match = EMAIL_PATTERN.search(text)
        if email_match:
            result["email"] = email_match.group()
        
        # Extract phone
        phone_match = PHONE_PATTERN.search(text)
        if phone_match:
            result["phone"] = phone_match.group()
        
        # Extract name (usually first non-empty line that's not an email/phone)
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and not EMAIL_PATTERN.search(line) and not PHONE_PATTERN.search(line):
                if len(line) < 50 and not any(kw in line.lower() for kw in ['resume', 'cv', 'curriculum']):
                    result["name"] = line
                    break
        
        # Extract skills
        result["skills"] = self._extract_skills(text_lower)
        
        # Extract education
        result["education"] = self._extract_education(text, lines)
        
        # Extract experience
        result["experience"] = self._extract_experience(text, lines)
        
        # Extract summary (look for summary/objective section)
        result["summary"] = self._extract_summary(text, lines)
        
        return result
    
    def _extract_skills(self, text_lower: str) -> List[str]:
        """Extract skills from text"""
        found_skills = []
        for skill in COMMON_SKILLS:
            # Use word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                # Normalize skill name
                normalized = skill.title()
                if normalized not in found_skills:
                    found_skills.append(normalized)
        return found_skills[:20]  # Limit to 20 skills
    
    def _extract_education(self, text: str, lines: List[str]) -> List[dict]:
        """Extract education entries"""
        education = []
        text_lower = text.lower()
        
        # Find education section
        edu_start = -1
        for i, line in enumerate(lines):
            if any(kw in line.lower() for kw in ['education', 'academic']):
                edu_start = i
                break
        
        if edu_start == -1:
            # No clear education section, scan whole document
            for line in lines:
                line_lower = line.lower()
                for kw in EDUCATION_KEYWORDS:
                    if kw in line_lower:
                        education.append({
                            "institution": line.strip()[:100],
                            "degree": None,
                            "field": None,
                            "year": self._extract_year(line)
                        })
                        break
        else:
            # Parse education section
            for line in lines[edu_start+1:edu_start+10]:
                line = line.strip()
                if not line:
                    continue
                if any(kw in line.lower() for kw in EXPERIENCE_KEYWORDS):
                    break
                if len(line) > 10:
                    education.append({
                        "institution": line[:100],
                        "degree": None,
                        "field": None,
                        "year": self._extract_year(line)
                    })
        
        return education[:5]  # Limit to 5 entries
    
    def _extract_experience(self, text: str, lines: List[str]) -> List[dict]:
        """Extract work experience entries"""
        experience = []
        
        # Find experience section
        exp_start = -1
        for i, line in enumerate(lines):
            if any(kw in line.lower() for kw in EXPERIENCE_KEYWORDS):
                exp_start = i
                break
        
        if exp_start == -1:
            return experience
        
        current_entry = None
        for line in lines[exp_start+1:exp_start+30]:
            line = line.strip()
            if not line:
                continue
            if any(kw in line.lower() for kw in ['education', 'skills', 'projects', 'certifications']):
                break
            
            # Look for company/title lines (usually have dates)
            if self._extract_year(line) or any(c in line for c in ['|', '–', '-', '•']):
                if current_entry:
                    experience.append(current_entry)
                current_entry = {
                    "company": line[:100],
                    "title": None,
                    "duration": self._extract_year(line),
                    "description": None
                }
            elif current_entry and len(line) > 20:
                # This is likely a description
                if not current_entry.get("description"):
                    current_entry["description"] = line[:200]
        
        if current_entry:
            experience.append(current_entry)
        
        return experience[:10]  # Limit to 10 entries
    
    def _extract_summary(self, text: str, lines: List[str]) -> Optional[str]:
        """Extract summary/objective section"""
        for i, line in enumerate(lines):
            if any(kw in line.lower() for kw in ['summary', 'objective', 'profile', 'about']):
                # Get next few lines as summary
                summary_lines = []
                for j in range(i+1, min(i+5, len(lines))):
                    next_line = lines[j].strip()
                    if next_line and len(next_line) > 20:
                        summary_lines.append(next_line)
                    elif not next_line:
                        break
                if summary_lines:
                    return ' '.join(summary_lines)[:500]
        return None
    
    def _extract_year(self, text: str) -> Optional[str]:
        """Extract year or date range from text"""
        # Look for year patterns like 2020, 2020-2022, 2020 - Present
        year_pattern = re.compile(r'20\d{2}(?:\s*[-–]\s*(?:20\d{2}|[Pp]resent|[Cc]urrent))?')
        match = year_pattern.search(text)
        return match.group() if match else None


# Singleton instance
parser = ResumeParser()


def parse_resume(filepath: str) -> dict:
    """Convenience function for parsing resumes"""
    return parser.parse_pdf(filepath)
