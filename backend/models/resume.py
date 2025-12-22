from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


def generate_resume_id():
    return f"resume_{uuid.uuid4().hex[:12]}"


class EducationItem(BaseModel):
    institution: str
    degree: Optional[str] = None
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    year: Optional[str] = None  # For backward compatibility
    gpa: Optional[str] = None
    achievements: List[str] = []


class ExperienceItem(BaseModel):
    company: str
    title: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[str] = None  # For backward compatibility
    is_current: bool = False
    description: Optional[str] = None
    achievements: List[str] = []  # Bullet points from resume


class ProjectItem(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: List[str] = []
    url: Optional[str] = None
    achievements: List[str] = []


class CertificationItem(BaseModel):
    name: str
    issuer: Optional[str] = None
    date: Optional[str] = None
    credential_id: Optional[str] = None
    url: Optional[str] = None


class ParsedResume(BaseModel):
    # Personal Info
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    
    # Professional Summary
    summary: Optional[str] = None
    objective: Optional[str] = None
    
    # Core Sections
    skills: List[str] = []
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []
    
    # Additional
    languages: List[str] = []
    interests: List[str] = []
    
    # Metadata
    total_years_experience: Optional[float] = None


class Resume(BaseModel):
    resume_id: str = Field(default_factory=generate_resume_id)
    user_id: str
    filename: str
    filepath: str
    status: str = "uploaded"  # uploaded, parsing, done, failed
    parsed_data: Optional[ParsedResume] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None


class ResumeResponse(BaseModel):
    resume_id: str
    user_id: str
    filename: str
    status: str
    parsed_data: Optional[ParsedResume] = None
    error_message: Optional[str] = None
    created_at: datetime
