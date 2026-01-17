"""
User Schemas - Request/Response models for authentication and user management
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from datetime import datetime, timezone
from enum import Enum
import uuid


class UserRole(str, Enum):
    FOUNDER = "founder"
    ENGINEER = "engineer"


def generate_user_id():
    return f"user_{uuid.uuid4().hex[:12]}"


def generate_id(prefix: str):
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ============ Request Schemas ============

class UserCreate(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=2)
    role: UserRole = Field(..., description="User role: founder or engineer")


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    """Schema for updating user profile"""
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None


# ============ Response Schemas ============

class UserResponse(BaseModel):
    """Schema for user response (public data)"""
    user_id: str
    email: str
    name: str
    role: UserRole
    avatar_url: Optional[str] = None
    created_at: datetime
    onboarding_completed: bool = False


class UserProfile(BaseModel):
    """Schema for full user profile"""
    user_id: str
    email: str
    name: str
    role: UserRole
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    onboarding_completed: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    """Schema for authentication token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============ Internal Schemas ============

class SessionData(BaseModel):
    """Schema for session storage"""
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
