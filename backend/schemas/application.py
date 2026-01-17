"""
Application Schemas - Request/Response models for job applications
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


def generate_application_id():
    return f"app_{uuid.uuid4().hex[:12]}"


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    INTERVIEWING = "interviewing"
    OFFERED = "offered"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


# ============ Request Schemas ============

class ApplicationCreate(BaseModel):
    """Schema for creating an application"""
    role_id: str
    cover_letter: Optional[str] = Field(None, max_length=3000)
    resume_url: Optional[str] = None
    answers: Optional[dict] = None  # For role-specific questions


class ApplicationUpdate(BaseModel):
    """Schema for updating application status (by founder)"""
    status: ApplicationStatus
    feedback: Optional[str] = None
    interview_date: Optional[datetime] = None


class ApplicationWithdraw(BaseModel):
    """Schema for withdrawing an application"""
    reason: Optional[str] = None


# ============ Response Schemas ============

class ApplicationResponse(BaseModel):
    """Schema for application response"""
    application_id: str
    role_id: str
    engineer_id: str
    startup_id: str
    cover_letter: Optional[str] = None
    status: ApplicationStatus
    match_score: Optional[float] = None  # AI-calculated match score
    feedback: Optional[str] = None
    interview_date: Optional[datetime] = None
    applied_at: datetime
    updated_at: Optional[datetime] = None
    # Populated fields
    role_title: Optional[str] = None
    startup_name: Optional[str] = None
    engineer_name: Optional[str] = None


class ApplicationListResponse(BaseModel):
    """Schema for paginated application list"""
    applications: List[ApplicationResponse]
    total: int
    page: int
    page_size: int
    has_more: bool
