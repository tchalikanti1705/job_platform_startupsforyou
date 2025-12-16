from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List, Optional
import logging

from models import (
    Application, ApplicationCreate, ApplicationStatusUpdate,
    ApplicationResponse, ApplicationWithJob, StatusHistoryItem,
    generate_application_id
)
from routers.auth import get_current_user, get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/applications", tags=["applications"])


def serialize_application(app: dict) -> dict:
    """Convert MongoDB application document to response format"""
    result = {k: v for k, v in app.items() if k != "_id"}
    
    # Convert datetime strings
    for field in ["resume_submitted_at", "applied_at", "deadline", "next_step_date", "created_at", "updated_at"]:
        if field in result and isinstance(result[field], str):
            result[field] = datetime.fromisoformat(result[field])
    
    # Convert status history timestamps
    if "status_history" in result:
        for item in result["status_history"]:
            if isinstance(item.get("changed_at"), str):
                item["changed_at"] = datetime.fromisoformat(item["changed_at"])
    
    return result


@router.post("", response_model=ApplicationResponse)
async def create_application(
    app_data: ApplicationCreate,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Create a new job application"""
    user_id = user["user_id"]
    now = datetime.now(timezone.utc)
    
    # Check if job exists
    job = await db.jobs.find_one({"job_id": app_data.job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing = await db.applications.find_one(
        {"user_id": user_id, "job_id": app_data.job_id},
        {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Get deadline from job
    deadline = job.get("application_deadline")
    if isinstance(deadline, str):
        deadline = datetime.fromisoformat(deadline)
    
    # Create application
    application_id = generate_application_id()
    
    initial_history = StatusHistoryItem(
        status="Applied",
        changed_at=now,
        notes=app_data.notes
    )
    
    application_doc = {
        "application_id": application_id,
        "user_id": user_id,
        "job_id": app_data.job_id,
        "status": "Applied",
        "resume_submitted_at": now.isoformat(),
        "applied_at": now.isoformat(),
        "deadline": deadline.isoformat() if deadline else None,
        "notes": app_data.notes,
        "next_step_date": None,
        "status_history": [initial_history.model_dump()],
        "created_at": now.isoformat(),
        "updated_at": None
    }
    
    # Convert status_history datetime for storage
    application_doc["status_history"][0]["changed_at"] = now.isoformat()
    
    await db.applications.insert_one(application_doc)
    
    # Add job info to response
    job_info = {
        "job_id": job["job_id"],
        "title": job.get("title"),
        "company": job.get("company"),
        "location": job.get("location")
    }
    
    return ApplicationResponse(
        application_id=application_id,
        user_id=user_id,
        job_id=app_data.job_id,
        status="Applied",
        resume_submitted_at=now,
        applied_at=now,
        deadline=deadline,
        notes=app_data.notes,
        next_step_date=None,
        status_history=[initial_history],
        job=job_info
    )


@router.get("", response_model=List[ApplicationWithJob])
async def get_applications(
    status: Optional[str] = None,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all applications for current user"""
    user_id = user["user_id"]
    
    query = {"user_id": user_id}
    if status:
        query["status"] = status
    
    cursor = db.applications.find(query, {"_id": 0}).sort("applied_at", -1)
    applications = await cursor.to_list(length=1000)
    
    # Get job details for each application
    result = []
    for app in applications:
        app_data = serialize_application(app)
        
        # Get job info
        job = await db.jobs.find_one({"job_id": app["job_id"]}, {"_id": 0})
        
        result.append(ApplicationWithJob(
            **app_data,
            job_title=job.get("title") if job else None,
            company=job.get("company") if job else None,
            job={
                "job_id": job["job_id"],
                "title": job.get("title"),
                "company": job.get("company"),
                "location": job.get("location")
            } if job else None
        ))
    
    return result


@router.get("/{application_id}", response_model=ApplicationWithJob)
async def get_application(
    application_id: str,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get single application by ID"""
    application = await db.applications.find_one(
        {"application_id": application_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = serialize_application(application)
    
    # Get job info
    job = await db.jobs.find_one({"job_id": application["job_id"]}, {"_id": 0})
    
    return ApplicationWithJob(
        **app_data,
        job_title=job.get("title") if job else None,
        company=job.get("company") if job else None,
        job={
            "job_id": job["job_id"],
            "title": job.get("title"),
            "company": job.get("company"),
            "location": job.get("location")
        } if job else None
    )


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    application_id: str,
    update_data: ApplicationStatusUpdate,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Update application status"""
    user_id = user["user_id"]
    now = datetime.now(timezone.utc)
    
    # Validate status
    valid_statuses = ["Applied", "Interview", "Offer", "Rejected"]
    if update_data.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Get application
    application = await db.applications.find_one(
        {"application_id": application_id, "user_id": user_id},
        {"_id": 0}
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Add to status history
    history_item = {
        "status": update_data.status,
        "changed_at": now.isoformat(),
        "notes": update_data.notes
    }
    
    # Build update
    update_doc = {
        "status": update_data.status,
        "updated_at": now.isoformat(),
        "$push": {"status_history": history_item}
    }
    
    if update_data.notes is not None:
        update_doc["notes"] = update_data.notes
    
    if update_data.next_step_date is not None:
        update_doc["next_step_date"] = update_data.next_step_date.isoformat()
    
    # Execute update
    await db.applications.update_one(
        {"application_id": application_id},
        {
            "$set": {
                "status": update_data.status,
                "updated_at": now.isoformat(),
                "notes": update_data.notes if update_data.notes is not None else application.get("notes"),
                "next_step_date": update_data.next_step_date.isoformat() if update_data.next_step_date else application.get("next_step_date")
            },
            "$push": {"status_history": history_item}
        }
    )
    
    # Get updated application
    updated = await db.applications.find_one(
        {"application_id": application_id},
        {"_id": 0}
    )
    
    return ApplicationResponse(**serialize_application(updated))


@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Delete an application"""
    result = await db.applications.delete_one(
        {"application_id": application_id, "user_id": user["user_id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"message": "Application deleted"}
