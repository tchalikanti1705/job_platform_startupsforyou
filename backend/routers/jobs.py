from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone
from typing import Optional, List
import logging

from models import (
    JobResponse, JobWithScore, JobSearchParams, StartupMapItem
)
from routers.auth import get_current_user, get_db
from services.matching import get_job_matches

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


def serialize_job(job: dict) -> dict:
    """Convert MongoDB job document to response format"""
    result = {k: v for k, v in job.items() if k != "_id"}
    
    # Convert datetime strings
    for field in ["date_posted", "application_deadline", "created_at"]:
        if field in result and isinstance(result[field], str):
            result[field] = datetime.fromisoformat(result[field])
    
    return result


@router.get("/search", response_model=List[JobResponse])
async def search_jobs(
    query: Optional[str] = None,
    skills: Optional[str] = None,  # Comma-separated
    experience_level: Optional[str] = None,
    location: Optional[str] = None,
    is_startup: Optional[bool] = None,
    remote: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db)
):
    """Search jobs with filters"""
    # Build query
    mongo_query = {}
    
    if query:
        mongo_query["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"company": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}}
        ]
    
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        mongo_query["skills_required"] = {
            "$elemMatch": {"$regex": "|".join(skill_list), "$options": "i"}
        }
    
    if experience_level:
        mongo_query["experience_level"] = experience_level
    
    if location:
        mongo_query["location"] = {"$regex": location, "$options": "i"}
    
    if is_startup is not None:
        mongo_query["is_startup"] = is_startup
    
    if remote is not None:
        mongo_query["remote"] = remote
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Execute query
    cursor = db.jobs.find(mongo_query, {"_id": 0}).sort("date_posted", -1).skip(skip).limit(limit)
    jobs = await cursor.to_list(length=limit)
    
    return [JobResponse(**serialize_job(job)) for job in jobs]


@router.get("/recommended", response_model=List[JobWithScore])
async def get_recommended_jobs(
    sort_by: str = Query("best_match", regex="^(best_match|newest)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get personalized job recommendations"""
    user_id = user["user_id"]
    
    # Get user profile
    profile = await db.profiles.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    if not profile:
        # Return jobs without matching if no profile
        cursor = db.jobs.find({}, {"_id": 0}).sort("date_posted", -1).limit(limit)
        jobs = await cursor.to_list(length=limit)
        return [JobWithScore(**serialize_job(job), match_score=0) for job in jobs]
    
    # Get all jobs for matching (in production, would use Elasticsearch)
    cursor = db.jobs.find({}, {"_id": 0})
    all_jobs = await cursor.to_list(length=500)
    
    # Calculate matches
    matched_jobs = get_job_matches(
        jobs=[serialize_job(j) for j in all_jobs],
        user_profile={
            "skills": profile.get("skills", []),
            "experience_level": profile.get("experience_level"),
            "preferred_roles": profile.get("preferred_roles", [])
        },
        sort_by=sort_by
    )
    
    # Paginate
    skip = (page - 1) * limit
    paginated = matched_jobs[skip:skip + limit]
    
    return [JobWithScore(**job) for job in paginated]


@router.get("/startups/list", response_model=List[StartupMapItem])
async def get_startup_list(
    db=Depends(get_db)
):
    """Get list of startups with job counts (for list view and future map)"""
    # Aggregate startups with job counts
    pipeline = [
        {"$match": {"is_startup": True}},
        {"$group": {
            "_id": "$company",
            "job_count": {"$sum": 1},
            "lat": {"$first": "$geo.lat"},
            "lng": {"$first": "$geo.lng"}
        }},
        {"$sort": {"job_count": -1}}
    ]
    
    cursor = db.jobs.aggregate(pipeline)
    startups = await cursor.to_list(length=100)
    
    result = []
    for startup in startups:
        result.append(StartupMapItem(
            startup_id=startup["_id"].replace(" ", "_").lower(),
            company=startup["_id"],
            lat=startup.get("lat") or 37.7749,  # Default to SF
            lng=startup.get("lng") or -122.4194,
            job_count=startup["job_count"]
        ))
    
    return result


@router.get("/startups/{company}/jobs", response_model=List[JobResponse])
async def get_startup_jobs(
    company: str,
    db=Depends(get_db)
):
    """Get jobs for a specific startup"""
    cursor = db.jobs.find(
        {"company": {"$regex": f"^{company}$", "$options": "i"}, "is_startup": True},
        {"_id": 0}
    ).sort("date_posted", -1)
    
    jobs = await cursor.to_list(length=100)
    
    return [JobResponse(**serialize_job(job)) for job in jobs]


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    db=Depends(get_db)
):
    """Get single job by ID"""
    job = await db.jobs.find_one(
        {"job_id": job_id},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobResponse(**serialize_job(job))
