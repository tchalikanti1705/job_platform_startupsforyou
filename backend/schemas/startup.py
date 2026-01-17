"""
Startup Schemas - Request/Response models for startup management
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


def generate_startup_id():
    return f"startup_{uuid.uuid4().hex[:12]}"


class FundingStage(str, Enum):
    PRE_SEED = "pre_seed"
    SEED = "seed"
    SERIES_A = "series_a"
    SERIES_B = "series_b"
    SERIES_C = "series_c"
    SERIES_D_PLUS = "series_d_plus"
    BOOTSTRAPPED = "bootstrapped"


class TeamSize(str, Enum):
    SOLO = "1"
    SMALL = "2-10"
    MEDIUM = "11-50"
    LARGE = "51-200"
    ENTERPRISE = "200+"


# ============ Request Schemas ============

class StartupCreate(BaseModel):
    """Schema for creating a startup profile"""
    name: str = Field(..., min_length=2, max_length=100)
    tagline: str = Field(..., max_length=200)
    description: str = Field(..., max_length=2000)
    website: Optional[str] = None
    logo_url: Optional[str] = None
    funding_stage: FundingStage
    team_size: TeamSize
    tech_stack: List[str] = Field(default_factory=list)
    industry: str
    location: str
    remote_friendly: bool = True


class StartupUpdate(BaseModel):
    """Schema for updating startup profile"""
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    funding_stage: Optional[FundingStage] = None
    team_size: Optional[TeamSize] = None
    tech_stack: Optional[List[str]] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    remote_friendly: Optional[bool] = None


# ============ Response Schemas ============

class StartupResponse(BaseModel):
    """Schema for startup response"""
    startup_id: str
    founder_id: str
    name: str
    tagline: str
    description: str
    website: Optional[str] = None
    logo_url: Optional[str] = None
    funding_stage: FundingStage
    team_size: TeamSize
    tech_stack: List[str]
    industry: str
    location: str
    remote_friendly: bool
    open_roles_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None


class StartupListResponse(BaseModel):
    """Schema for paginated startup list"""
    startups: List[StartupResponse]
    total: int
    page: int
    page_size: int
    has_more: bool
