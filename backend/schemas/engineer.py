"""
Engineer Profile Schemas - Request/Response models for engineer/candidate profiles
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


def generate_engineer_profile_id():
    return f"eng_{uuid.uuid4().hex[:12]}"


class AvailabilityStatus(str, Enum):
    ACTIVELY_LOOKING = "actively_looking"
    OPEN_TO_OPPORTUNITIES = "open_to_opportunities"
    NOT_LOOKING = "not_looking"


class WorkPreference(str, Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"
    ANY = "any"


class Experience(BaseModel):
    """Work experience model"""
    company: str
    title: str
    start_date: str  # YYYY-MM format
    end_date: Optional[str] = None  # None = current
    description: Optional[str] = None
    is_current: bool = False


class Education(BaseModel):
    """Education model"""
    institution: str
    degree: str
    field_of_study: str
    graduation_year: int


# ============ Request Schemas ============

class EngineerProfileCreate(BaseModel):
    """Schema for creating engineer profile"""
    headline: str = Field(..., max_length=200)
    bio: str = Field(..., max_length=2000)
    skills: List[str] = Field(default_factory=list)
    experience_years: int = Field(..., ge=0, le=50)
    experience: List[Experience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    availability: AvailabilityStatus = AvailabilityStatus.OPEN_TO_OPPORTUNITIES
    work_preference: WorkPreference = WorkPreference.ANY
    preferred_locations: List[str] = Field(default_factory=list)
    salary_expectation_min: Optional[int] = None
    salary_expectation_max: Optional[int] = None
    open_to_equity: bool = True


class EngineerProfileUpdate(BaseModel):
    """Schema for updating engineer profile"""
    headline: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None
    experience: Optional[List[Experience]] = None
    education: Optional[List[Education]] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    availability: Optional[AvailabilityStatus] = None
    work_preference: Optional[WorkPreference] = None
    preferred_locations: Optional[List[str]] = None
    salary_expectation_min: Optional[int] = None
    salary_expectation_max: Optional[int] = None
    open_to_equity: Optional[bool] = None


# ============ Response Schemas ============

class EngineerProfileResponse(BaseModel):
    """Schema for engineer profile response"""
    profile_id: str
    user_id: str
    name: str
    avatar_url: Optional[str] = None
    headline: str
    bio: str
    skills: List[str]
    experience_years: int
    experience: List[Experience]
    education: List[Education]
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    availability: AvailabilityStatus
    work_preference: WorkPreference
    preferred_locations: List[str]
    open_to_equity: bool
    match_score: Optional[float] = None  # Populated by AI matching
    created_at: datetime
    updated_at: Optional[datetime] = None


class EngineerListResponse(BaseModel):
    """Schema for paginated engineer list"""
    engineers: List[EngineerProfileResponse]
    total: int
    page: int
    page_size: int
    has_more: bool
