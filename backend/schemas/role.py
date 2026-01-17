"""
Role Schemas - Request/Response models for job roles/positions
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


def generate_role_id():
    return f"role_{uuid.uuid4().hex[:12]}"


class RoleStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"


class ExperienceLevel(str, Enum):
    INTERN = "intern"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    PRINCIPAL = "principal"


class EmploymentType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"


class SalaryRange(BaseModel):
    """Salary range model"""
    min_amount: int
    max_amount: int
    currency: str = "USD"
    equity_percentage: Optional[float] = None


# ============ Request Schemas ============

class RoleCreate(BaseModel):
    """Schema for creating a role"""
    title: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., max_length=5000)
    requirements: List[str] = Field(default_factory=list)
    nice_to_have: List[str] = Field(default_factory=list)
    skills_required: List[str] = Field(default_factory=list)
    experience_level: ExperienceLevel
    employment_type: EmploymentType
    salary_range: Optional[SalaryRange] = None
    location: str
    remote_allowed: bool = True
    visa_sponsorship: bool = False


class RoleUpdate(BaseModel):
    """Schema for updating a role"""
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    nice_to_have: Optional[List[str]] = None
    skills_required: Optional[List[str]] = None
    experience_level: Optional[ExperienceLevel] = None
    employment_type: Optional[EmploymentType] = None
    salary_range: Optional[SalaryRange] = None
    location: Optional[str] = None
    remote_allowed: Optional[bool] = None
    visa_sponsorship: Optional[bool] = None
    status: Optional[RoleStatus] = None


# ============ Response Schemas ============

class RoleResponse(BaseModel):
    """Schema for role response"""
    role_id: str
    startup_id: str
    title: str
    description: str
    requirements: List[str]
    nice_to_have: List[str]
    skills_required: List[str]
    experience_level: ExperienceLevel
    employment_type: EmploymentType
    salary_range: Optional[SalaryRange] = None
    location: str
    remote_allowed: bool
    visa_sponsorship: bool
    status: RoleStatus
    applications_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Populated fields
    startup_name: Optional[str] = None
    startup_logo: Optional[str] = None


class RoleListResponse(BaseModel):
    """Schema for paginated role list"""
    roles: List[RoleResponse]
    total: int
    page: int
    page_size: int
    has_more: bool
