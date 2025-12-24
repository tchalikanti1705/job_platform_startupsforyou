from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.responses import RedirectResponse
from datetime import datetime, timezone, timedelta
from typing import Optional
import httpx
import os
import logging
import secrets

from models import generate_user_id, UserResponse, TokenResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["oauth"])

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# JWT Configuration (same as auth.py)
JWT_SECRET = os.environ.get("JWT_SECRET", "job-platform-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days


def get_db():
    """Dependency to get database - will be injected from main app"""
    from server import db
    return db


def create_jwt_token(user_id: str, email: str) -> str:
    """Create JWT token"""
    import jwt
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_session_token() -> str:
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)


# ============== GOOGLE OAUTH ==============

@router.get("/google")
async def google_login():
    """
    Redirect user to Google OAuth consent screen
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    # Build Google OAuth URL
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    
    return RedirectResponse(url=google_auth_url)


@router.get("/google/callback")
async def google_callback(code: str = None, error: str = None, db=Depends(get_db)):
    """
    Handle Google OAuth callback
    """
    if error:
        logger.error(f"Google OAuth error: {error}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=google_auth_failed")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=no_code")
    
    try:
        # Step 1: Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": GOOGLE_REDIRECT_URI
                }
            )
        
        if token_response.status_code != 200:
            logger.error(f"Google token exchange failed: {token_response.text}")
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=token_exchange_failed")
        
        tokens = token_response.json()
        access_token = tokens.get("access_token")
        
        if not access_token:
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=no_access_token")
        
        # Step 2: Fetch user info from Google
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
        
        if user_response.status_code != 200:
            logger.error(f"Google user info fetch failed: {user_response.text}")
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=user_info_failed")
        
        google_user = user_response.json()
        
        # Extract user info
        google_id = google_user.get("id")
        email = google_user.get("email")
        name = google_user.get("name", email.split("@")[0] if email else "User")
        picture = google_user.get("picture")
        
        if not email:
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=no_email")
        
        # Step 3: Find or create user in database
        existing_user = await db.users.find_one({"email": email}, {"_id": 0})
        
        now = datetime.now(timezone.utc)
        
        if existing_user:
            # Update existing user with Google info if not already set
            user = existing_user
            user_id = user["user_id"]
            
            # Update provider info if this is first Google login
            if user.get("auth_provider") != "google":
                await db.users.update_one(
                    {"email": email},
                    {"$set": {
                        "auth_provider": "google",
                        "provider_id": google_id,
                        "picture": picture or user.get("picture"),
                        "updated_at": now.isoformat()
                    }}
                )
        else:
            # Create new user
            user_id = generate_user_id()
            
            user_doc = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "password_hash": None,  # No password for OAuth users
                "auth_provider": "google",
                "provider_id": google_id,
                "created_at": now.isoformat(),
                "onboarding_completed": False
            }
            await db.users.insert_one(user_doc)
            
            # Create profile
            profile_doc = {
                "user_id": user_id,
                "email": email,
                "name": name,
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
            
            user = user_doc
        
        # Step 4: Create session
        session_token = create_session_token()
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (now + timedelta(days=7)).isoformat(),
            "created_at": now.isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        # Step 5: Create JWT token
        jwt_token = create_jwt_token(user_id, email)
        
        # Step 6: Redirect to frontend with token
        response = RedirectResponse(
            url=f"{FRONTEND_URL}/oauth/callback?token={jwt_token}",
            status_code=302
        )
        
        # Set session cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=60 * 60 * 24 * 7  # 7 days
        )
        
        logger.info(f"Google OAuth successful for user: {email}")
        return response
        
    except Exception as e:
        logger.error(f"Google OAuth error: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=oauth_failed")
