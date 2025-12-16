from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


def generate_application_id():
    return f"app_{uuid.uuid4().hex[:12]}"


class StatusHistoryItem(BaseModel):
    status: str
    changed_at: datetime
    notes: Optional[str] = None


class Application(BaseModel):
    application_id: str = Field(default_factory=generate_application_id)
    user_id: str
    job_id: str
    status: str = "Applied"  # Applied, Interview, Offer, Rejected
    resume_submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    applied_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deadline: Optional[datetime] = None
    notes: Optional[str] = None
    next_step_date: Optional[datetime] = None
    status_history: List[StatusHistoryItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None


class ApplicationCreate(BaseModel):
    job_id: str
    notes: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    next_step_date: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    application_id: str
    user_id: str
    job_id: str
    status: str
    resume_submitted_at: datetime
    applied_at: datetime
    deadline: Optional[datetime] = None
    notes: Optional[str] = None
    next_step_date: Optional[datetime] = None
    status_history: List[StatusHistoryItem] = []
    job: Optional[dict] = None  # Will include job details


class ApplicationWithJob(ApplicationResponse):
    job_title: Optional[str] = None
    company: Optional[str] = None
