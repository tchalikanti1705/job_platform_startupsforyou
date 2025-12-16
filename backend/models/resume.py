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
    year: Optional[str] = None


class ExperienceItem(BaseModel):
    company: str
    title: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class ParsedResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    summary: Optional[str] = None


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
