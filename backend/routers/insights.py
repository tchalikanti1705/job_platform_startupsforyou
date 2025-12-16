from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import logging

from routers.auth import get_current_user, get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/summary")
async def get_insights_summary(
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get overall insights summary"""
    user_id = user["user_id"]
    
    # Get all applications
    applications = await db.applications.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(length=1000)
    
    # Calculate stats
    total = len(applications)
    by_status = {
        "Applied": 0,
        "Interview": 0,
        "Offer": 0,
        "Rejected": 0
    }
    
    for app in applications:
        status = app.get("status", "Applied")
        if status in by_status:
            by_status[status] += 1
    
    # Calculate response rate (any status change from Applied)
    responses = by_status["Interview"] + by_status["Offer"] + by_status["Rejected"]
    response_rate = (responses / total * 100) if total > 0 else 0
    
    # Calculate interview rate
    interview_rate = (by_status["Interview"] / total * 100) if total > 0 else 0
    
    # Calculate offer rate from interviews
    interviews_total = by_status["Interview"] + by_status["Offer"]
    offer_rate = (by_status["Offer"] / interviews_total * 100) if interviews_total > 0 else 0
    
    # Get this week's applications
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    this_week = sum(
        1 for app in applications
        if datetime.fromisoformat(app.get("applied_at", "2000-01-01T00:00:00")) > week_ago
    )
    
    return {
        "total_applications": total,
        "by_status": by_status,
        "response_rate": round(response_rate, 1),
        "interview_rate": round(interview_rate, 1),
        "offer_rate": round(offer_rate, 1),
        "this_week": this_week,
        "pending": by_status["Applied"],
        "active": by_status["Interview"]
    }


@router.get("/timeseries")
async def get_timeseries(
    range: str = Query("week", regex="^(day|week|month|year)$"),
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get application timeseries data"""
    user_id = user["user_id"]
    now = datetime.now(timezone.utc)
    
    # Calculate date range
    if range == "day":
        start_date = now - timedelta(days=1)
        interval = "hour"
        num_points = 24
    elif range == "week":
        start_date = now - timedelta(days=7)
        interval = "day"
        num_points = 7
    elif range == "month":
        start_date = now - timedelta(days=30)
        interval = "day"
        num_points = 30
    else:  # year
        start_date = now - timedelta(days=365)
        interval = "month"
        num_points = 12
    
    # Get applications in range
    applications = await db.applications.find(
        {
            "user_id": user_id,
            "applied_at": {"$gte": start_date.isoformat()}
        },
        {"_id": 0}
    ).to_list(length=1000)
    
    # Group by interval
    data_points = []
    
    if interval == "hour":
        for i in range(num_points):
            point_start = now - timedelta(hours=num_points - i)
            point_end = now - timedelta(hours=num_points - i - 1)
            count = sum(
                1 for app in applications
                if point_start <= datetime.fromisoformat(app.get("applied_at", "2000-01-01T00:00:00")).replace(tzinfo=timezone.utc) < point_end
            )
            data_points.append({
                "label": point_start.strftime("%H:%M"),
                "applications": count
            })
    
    elif interval == "day":
        for i in range(num_points):
            point_date = (now - timedelta(days=num_points - i - 1)).date()
            count = sum(
                1 for app in applications
                if datetime.fromisoformat(app.get("applied_at", "2000-01-01T00:00:00")).date() == point_date
            )
            data_points.append({
                "label": point_date.strftime("%b %d"),
                "applications": count
            })
    
    else:  # month
        for i in range(num_points):
            point_month = (now - timedelta(days=30 * (num_points - i - 1))).replace(day=1)
            next_month = (point_month + timedelta(days=32)).replace(day=1)
            count = sum(
                1 for app in applications
                if point_month <= datetime.fromisoformat(app.get("applied_at", "2000-01-01T00:00:00")).replace(tzinfo=timezone.utc) < next_month
            )
            data_points.append({
                "label": point_month.strftime("%b"),
                "applications": count
            })
    
    return {
        "range": range,
        "interval": interval,
        "data": data_points
    }


@router.get("/funnel")
async def get_funnel(
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get conversion funnel data"""
    user_id = user["user_id"]
    
    # Get all applications
    applications = await db.applications.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(length=1000)
    
    total = len(applications)
    
    # Count by status
    applied = total
    interviewed = sum(
        1 for app in applications
        if app.get("status") in ["Interview", "Offer"]
    )
    offered = sum(
        1 for app in applications
        if app.get("status") == "Offer"
    )
    
    return {
        "stages": [
            {
                "name": "Applied",
                "count": applied,
                "percentage": 100
            },
            {
                "name": "Interview",
                "count": interviewed,
                "percentage": round((interviewed / applied * 100) if applied > 0 else 0, 1)
            },
            {
                "name": "Offer",
                "count": offered,
                "percentage": round((offered / applied * 100) if applied > 0 else 0, 1)
            }
        ]
    }


@router.get("/table")
async def get_applications_table(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get applications table data for insights"""
    user_id = user["user_id"]
    
    # Get applications with pagination
    skip = (page - 1) * limit
    
    cursor = db.applications.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("applied_at", -1).skip(skip).limit(limit)
    
    applications = await cursor.to_list(length=limit)
    
    # Get total count
    total = await db.applications.count_documents({"user_id": user_id})
    
    # Enrich with job data
    result = []
    for app in applications:
        job = await db.jobs.find_one({"job_id": app["job_id"]}, {"_id": 0})
        
        # Convert datetimes
        applied_at = app.get("applied_at")
        if isinstance(applied_at, str):
            applied_at = datetime.fromisoformat(applied_at)
        
        deadline = app.get("deadline")
        if isinstance(deadline, str):
            deadline = datetime.fromisoformat(deadline)
        
        resume_submitted_at = app.get("resume_submitted_at")
        if isinstance(resume_submitted_at, str):
            resume_submitted_at = datetime.fromisoformat(resume_submitted_at)
        
        result.append({
            "application_id": app["application_id"],
            "job_id": app["job_id"],
            "job_title": job.get("title") if job else "Unknown",
            "company": job.get("company") if job else "Unknown",
            "status": app.get("status"),
            "applied_at": applied_at.isoformat() if applied_at else None,
            "deadline": deadline.isoformat() if deadline else None,
            "resume_submitted_at": resume_submitted_at.isoformat() if resume_submitted_at else None
        })
    
    return {
        "data": result,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }
