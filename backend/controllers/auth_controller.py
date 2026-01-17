"""
Auth Controller - Handles authentication business logic
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
import bcrypt
import jwt
import os
import logging

from schemas.user import (
    UserCreate, UserLogin, UserResponse, TokenResponse, UserRole,
    generate_user_id
)

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "startupsofryou-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days


class AuthController:
    """Controller for authentication operations"""
    
    def __init__(self, db):
        self.db = db
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode(), hashed.encode())
    
    @staticmethod
    def create_jwt_token(user_id: str, email: str, role: str) -> str:
        """Create JWT token"""
        payload = {
            "user_id": user_id,
            "email": email,
            "role": role,
            "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
            "iat": datetime.now(timezone.utc)
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def decode_jwt_token(token: str) -> Optional[dict]:
        """Decode and verify JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    async def signup(self, user_data: UserCreate) -> TokenResponse:
        """Register a new user"""
        # Check if user exists
        existing = await self.db.users.find_one({"email": user_data.email})
        if existing:
            raise ValueError("Email already registered")
        
        # Create user
        user_id = generate_user_id()
        now = datetime.now(timezone.utc)
        
        user_doc = {
            "user_id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": user_data.role.value,
            "password_hash": self.hash_password(user_data.password),
            "avatar_url": None,
            "created_at": now.isoformat(),
            "onboarding_completed": False
        }
        
        await self.db.users.insert_one(user_doc)
        
        # Create role-specific profile
        if user_data.role == UserRole.ENGINEER:
            await self._create_engineer_profile(user_id, user_data.email, user_data.name, now)
        elif user_data.role == UserRole.FOUNDER:
            await self._create_founder_profile(user_id, user_data.email, user_data.name, now)
        
        # Create JWT token
        token = self.create_jwt_token(user_id, user_data.email, user_data.role.value)
        
        user_response = UserResponse(
            user_id=user_id,
            email=user_data.email,
            name=user_data.name,
            role=user_data.role,
            created_at=now,
            onboarding_completed=False
        )
        
        return TokenResponse(access_token=token, user=user_response)
    
    async def login(self, login_data: UserLogin) -> TokenResponse:
        """Login user with email/password"""
        user = await self.db.users.find_one({"email": login_data.email})
        
        if not user:
            raise ValueError("Invalid email or password")
        
        if not self.verify_password(login_data.password, user["password_hash"]):
            raise ValueError("Invalid email or password")
        
        # Create JWT token
        token = self.create_jwt_token(user["user_id"], user["email"], user["role"])
        
        created_at = user["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        user_response = UserResponse(
            user_id=user["user_id"],
            email=user["email"],
            name=user["name"],
            role=UserRole(user["role"]),
            avatar_url=user.get("avatar_url"),
            created_at=created_at,
            onboarding_completed=user.get("onboarding_completed", False)
        )
        
        return TokenResponse(access_token=token, user=user_response)
    
    async def get_current_user(self, user_id: str) -> Optional[dict]:
        """Get current user by ID"""
        user = await self.db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        return user
    
    async def _create_engineer_profile(self, user_id: str, email: str, name: str, created_at: datetime):
        """Create initial engineer profile"""
        profile_doc = {
            "profile_id": f"eng_{user_id[5:]}",
            "user_id": user_id,
            "email": email,
            "name": name,
            "headline": "",
            "bio": "",
            "skills": [],
            "experience_years": 0,
            "experience": [],
            "education": [],
            "availability": "open_to_opportunities",
            "work_preference": "any",
            "preferred_locations": [],
            "open_to_equity": True,
            "created_at": created_at.isoformat(),
            "updated_at": None
        }
        await self.db.engineer_profiles.insert_one(profile_doc)
    
    async def _create_founder_profile(self, user_id: str, email: str, name: str, created_at: datetime):
        """Create initial founder profile"""
        profile_doc = {
            "profile_id": f"founder_{user_id[5:]}",
            "user_id": user_id,
            "email": email,
            "name": name,
            "startup_id": None,  # Will be set when they create a startup
            "created_at": created_at.isoformat(),
            "updated_at": None
        }
        await self.db.founder_profiles.insert_one(profile_doc)
