from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone
import uuid


def generate_job_id():
    return f"job_{uuid.uuid4().hex[:12]}"


class GeoLocation(BaseModel):
    lat: float
    lng: float


class Job(BaseModel):
    job_id: str = Field(default_factory=generate_job_id)
    title: str
    company: str
    description: str
    location: str
    geo: Optional[GeoLocation] = None
    date_posted: datetime
    application_deadline: Optional[datetime] = None
    skills_required: List[str] = []
    experience_level: str  # entry, mid, senior
    is_startup: bool = False
    funding_stage: Optional[str] = None  # Seed, Series A, Series B, Series C, Series D+, Unicorn
    salary_range: Optional[str] = None
    job_type: str = "full-time"  # full-time, part-time, contract, internship
    remote: bool = False
    company_logo: Optional[str] = None
    apply_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class JobResponse(BaseModel):
    job_id: str
    title: str
    company: str
    description: str
    location: str
    geo: Optional[GeoLocation] = None
    date_posted: datetime
    application_deadline: Optional[datetime] = None
    skills_required: List[str] = []
    experience_level: str
    is_startup: bool = False
    funding_stage: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: str = "full-time"
    remote: bool = False
    company_logo: Optional[str] = None
    apply_url: Optional[str] = None


class JobWithScore(JobResponse):
    match_score: float = 0.0
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    why_recommended: str = ""


class JobSearchParams(BaseModel):
    query: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    location: Optional[str] = None
    is_startup: Optional[bool] = None
    remote: Optional[bool] = None
    sort_by: str = "newest"  # newest, best_match
    page: int = 1
    limit: int = 20


class StartupMapItem(BaseModel):
    startup_id: str
    company: str
    lat: float
    lng: float
    job_count: int
    funding_stage: Optional[str] = None
