from fastapi import APIRouter, HTTPException, Depends, Response, Request
from datetime import datetime, timezone, timedelta
from typing import Optional
import bcrypt
import jwt
import os
import httpx
import logging

from models import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    SessionData, generate_user_id
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "job-platform-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Emergent Auth URL
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


def get_db():
    """Dependency to get database - will be injected from main app"""
    from server import db
    return db


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_jwt_token(user_id: str, email: str) -> str:
    """Create JWT token"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> Optional[dict]:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def get_current_user(request: Request, db=Depends(get_db)) -> dict:
    """
    Get current user from session token (cookie) or JWT (header)
    """
    # Check session token from cookie first
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Verify session
        session = await db.user_sessions.find_one(
            {"session_token": session_token},
            {"_id": 0}
        )
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one(
                    {"user_id": session["user_id"]},
                    {"_id": 0}
                )
                if user:
                    return user
    
    # Fall back to JWT from Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_jwt_token(token)
        if payload:
            user = await db.users.find_one(
                {"user_id": payload["user_id"]},
                {"_id": 0}
            )
            if user:
                return user
    
    raise HTTPException(status_code=401, detail="Not authenticated")


@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate, db=Depends(get_db)):
    """Register a new user with email/password"""
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = generate_user_id()
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "picture": None,
        "created_at": now.isoformat(),
        "onboarding_completed": False
    }
    
    await db.users.insert_one(user_doc)
    
    # Create profile
    profile_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "picture": None,
        "skills": [],
        "experience_level": None,
        "preferred_location": None,
        "preferred_roles": [],
        "resume_id": None,
        "onboarding_completed": False,
        "created_at": now.isoformat(),
        "updated_at": None
    }
    await db.profiles.insert_one(profile_doc)
    
    # Create JWT token
    token = create_jwt_token(user_id, user_data.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            user_id=user_id,
            email=user_data.email,
            name=user_data.name,
            picture=None,
            created_at=now,
            onboarding_completed=False
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db=Depends(get_db)):
    """Login with email/password"""
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create JWT token
    token = create_jwt_token(user["user_id"], user["email"])
    
    # Parse created_at
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            user_id=user["user_id"],
            email=user["email"],
            name=user["name"],
            picture=user.get("picture"),
            created_at=created_at,
            onboarding_completed=user.get("onboarding_completed", False)
        )
    )


@router.post("/session")
async def exchange_session(request: Request, response: Response, db=Depends(get_db)):
    """
    Exchange Emergent OAuth session_id for our session
    Called after Google OAuth redirect
    """
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id with Emergent Auth
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": session_id}
            )
            
            if resp.status_code != 200:
                logger.error(f"Emergent auth failed: {resp.status_code} - {resp.text}")
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = resp.json()
    except httpx.RequestError as e:
        logger.error(f"Emergent auth request failed: {e}")
        raise HTTPException(status_code=500, detail="Authentication service unavailable")
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    emergent_session_token = auth_data.get("session_token")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by OAuth")
    
    now = datetime.now(timezone.utc)
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": name or existing_user.get("name"),
                "picture": picture or existing_user.get("picture"),
                "updated_at": now.isoformat()
            }}
        )
        onboarding_completed = existing_user.get("onboarding_completed", False)
    else:
        # Create new user
        user_id = generate_user_id()
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name or "User",
            "picture": picture,
            "password_hash": None,  # OAuth user, no password
            "created_at": now.isoformat(),
            "onboarding_completed": False
        }
        await db.users.insert_one(user_doc)
        
        # Create profile
        profile_doc = {
            "user_id": user_id,
            "email": email,
            "name": name or "User",
            "picture": picture,
            "skills": [],
            "experience_level": None,
            "preferred_location": None,
            "preferred_roles": [],
            "resume_id": None,
            "onboarding_completed": False,
            "created_at": now.isoformat(),
            "updated_at": None
        }
        await db.profiles.insert_one(profile_doc)
        onboarding_completed = False
    
    # Create our session
    session_token = f"sess_{generate_user_id()}"
    expires_at = now + timedelta(days=7)
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": now.isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    # Get user for response
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return {
        "user_id": user_id,
        "email": email,
        "name": user.get("name"),
        "picture": user.get("picture"),
        "onboarding_completed": onboarding_completed,
        "created_at": created_at.isoformat() if created_at else None
    }


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user info"""
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        picture=user.get("picture"),
        created_at=created_at,
        onboarding_completed=user.get("onboarding_completed", False)
    )


@router.post("/logout")
async def logout(request: Request, response: Response, db=Depends(get_db)):
    """Logout user - clear session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}
