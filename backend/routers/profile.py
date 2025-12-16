from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from datetime import datetime, timezone
from typing import Optional
import os
import shutil
import logging

from models import (
    UserProfile, ProfileUpdate, ResumeResponse, ParsedResume,
    generate_resume_id
)
from routers.auth import get_current_user, get_db
from services.resume_parser import parse_resume

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["profile"])

# Resume storage path
STORAGE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "resumes")
os.makedirs(STORAGE_PATH, exist_ok=True)


async def process_resume(resume_id: str, filepath: str, user_id: str, db):
    """Background task to process resume"""
    try:
        # Update status to parsing
        await db.resumes.update_one(
            {"resume_id": resume_id},
            {"$set": {"status": "parsing", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Parse resume
        parsed_data = parse_resume(filepath)
        
        if "error" in parsed_data:
            await db.resumes.update_one(
                {"resume_id": resume_id},
                {"$set": {
                    "status": "failed",
                    "error_message": parsed_data["error"],
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            return
        
        # Update resume with parsed data
        await db.resumes.update_one(
            {"resume_id": resume_id},
            {"$set": {
                "status": "done",
                "parsed_data": parsed_data,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update user profile with parsed data
        profile_update = {
            "resume_id": resume_id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if parsed_data.get("skills"):
            profile_update["skills"] = parsed_data["skills"]
        if parsed_data.get("name"):
            profile_update["name"] = parsed_data["name"]
        
        await db.profiles.update_one(
            {"user_id": user_id},
            {"$set": profile_update}
        )
        
        logger.info(f"Resume {resume_id} processed successfully")
        
    except Exception as e:
        logger.error(f"Error processing resume {resume_id}: {e}")
        await db.resumes.update_one(
            {"resume_id": resume_id},
            {"$set": {
                "status": "failed",
                "error_message": str(e),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )


@router.post("/resume/upload", response_model=ResumeResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Upload resume PDF for parsing"""
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Check file size (max 10MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    user_id = user["user_id"]
    resume_id = generate_resume_id()
    now = datetime.now(timezone.utc)
    
    # Save file
    filename = f"{resume_id}_{file.filename}"
    filepath = os.path.join(STORAGE_PATH, filename)
    
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file")
    
    # Create resume record
    resume_doc = {
        "resume_id": resume_id,
        "user_id": user_id,
        "filename": file.filename,
        "filepath": filepath,
        "status": "uploaded",
        "parsed_data": None,
        "error_message": None,
        "created_at": now.isoformat(),
        "updated_at": None
    }
    
    await db.resumes.insert_one(resume_doc)
    
    # Start background processing
    background_tasks.add_task(process_resume, resume_id, filepath, user_id, db)
    
    return ResumeResponse(
        resume_id=resume_id,
        user_id=user_id,
        filename=file.filename,
        status="uploaded",
        parsed_data=None,
        error_message=None,
        created_at=now
    )


@router.get("/resume/{resume_id}/status", response_model=ResumeResponse)
async def get_resume_status(
    resume_id: str,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get resume parsing status"""
    resume = await db.resumes.find_one(
        {"resume_id": resume_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    created_at = resume.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    parsed_data = resume.get("parsed_data")
    
    return ResumeResponse(
        resume_id=resume["resume_id"],
        user_id=resume["user_id"],
        filename=resume["filename"],
        status=resume["status"],
        parsed_data=ParsedResume(**parsed_data) if parsed_data else None,
        error_message=resume.get("error_message"),
        created_at=created_at
    )


@router.get("/me", response_model=UserProfile)
async def get_profile(
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get current user's profile"""
    profile = await db.profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    created_at = profile.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    updated_at = profile.get("updated_at")
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    
    return UserProfile(
        user_id=profile["user_id"],
        email=profile["email"],
        name=profile["name"],
        picture=profile.get("picture"),
        skills=profile.get("skills", []),
        experience_level=profile.get("experience_level"),
        preferred_location=profile.get("preferred_location"),
        preferred_roles=profile.get("preferred_roles", []),
        resume_id=profile.get("resume_id"),
        onboarding_completed=profile.get("onboarding_completed", False),
        created_at=created_at,
        updated_at=updated_at
    )


@router.put("/me", response_model=UserProfile)
async def update_profile(
    update_data: ProfileUpdate,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Update user profile"""
    user_id = user["user_id"]
    now = datetime.now(timezone.utc)
    
    # Build update document
    update_doc = {"updated_at": now.isoformat()}
    
    if update_data.name is not None:
        update_doc["name"] = update_data.name
    if update_data.skills is not None:
        update_doc["skills"] = update_data.skills
    if update_data.experience_level is not None:
        update_doc["experience_level"] = update_data.experience_level
    if update_data.preferred_location is not None:
        update_doc["preferred_location"] = update_data.preferred_location
    if update_data.preferred_roles is not None:
        update_doc["preferred_roles"] = update_data.preferred_roles
    
    await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": update_doc}
    )
    
    # Also update user's name if changed
    if update_data.name is not None:
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": update_data.name, "updated_at": now.isoformat()}}
        )
    
    # Get updated profile
    profile = await db.profiles.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    created_at = profile.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return UserProfile(
        user_id=profile["user_id"],
        email=profile["email"],
        name=profile["name"],
        picture=profile.get("picture"),
        skills=profile.get("skills", []),
        experience_level=profile.get("experience_level"),
        preferred_location=profile.get("preferred_location"),
        preferred_roles=profile.get("preferred_roles", []),
        resume_id=profile.get("resume_id"),
        onboarding_completed=profile.get("onboarding_completed", False),
        created_at=created_at,
        updated_at=now
    )


@router.post("/me/complete-onboarding")
async def complete_onboarding(
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Mark onboarding as complete"""
    user_id = user["user_id"]
    now = datetime.now(timezone.utc)
    
    await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": {"onboarding_completed": True, "updated_at": now.isoformat()}}
    )
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"onboarding_completed": True, "updated_at": now.isoformat()}}
    )
    
    return {"message": "Onboarding completed"}
