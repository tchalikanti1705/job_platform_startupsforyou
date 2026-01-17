"""
Application Controller - Handles job applications
"""
from datetime import datetime, timezone
from typing import Optional, List
import logging

from schemas.application import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse,
    ApplicationListResponse, ApplicationStatus, generate_application_id
)

logger = logging.getLogger(__name__)


class ApplicationController:
    """Controller for application operations"""
    
    def __init__(self, db):
        self.db = db
    
    async def create_application(self, engineer_id: str, data: ApplicationCreate) -> ApplicationResponse:
        """Create a new job application"""
        # Check if role exists and is active
        role = await self.db.roles.find_one({"role_id": data.role_id})
        if not role:
            raise ValueError("Role not found")
        if role["status"] != "active":
            raise ValueError("This role is no longer accepting applications")
        
        # Check for existing application
        existing = await self.db.applications.find_one({
            "role_id": data.role_id,
            "engineer_id": engineer_id
        })
        if existing:
            raise ValueError("You have already applied to this role")
        
        application_id = generate_application_id()
        now = datetime.now(timezone.utc)
        
        application_doc = {
            "application_id": application_id,
            "role_id": data.role_id,
            "engineer_id": engineer_id,
            "startup_id": role["startup_id"],
            "cover_letter": data.cover_letter,
            "resume_url": data.resume_url,
            "answers": data.answers,
            "status": ApplicationStatus.PENDING.value,
            "match_score": None,  # Will be set by AI matching service
            "feedback": None,
            "interview_date": None,
            "applied_at": now.isoformat(),
            "updated_at": None
        }
        
        await self.db.applications.insert_one(application_doc)
        
        # Get role and startup info for response
        startup = await self.db.startups.find_one({"startup_id": role["startup_id"]})
        engineer = await self.db.users.find_one({"user_id": engineer_id})
        
        return ApplicationResponse(
            application_id=application_id,
            role_id=data.role_id,
            engineer_id=engineer_id,
            startup_id=role["startup_id"],
            cover_letter=data.cover_letter,
            status=ApplicationStatus.PENDING,
            applied_at=now,
            role_title=role["title"],
            startup_name=startup["name"] if startup else None,
            engineer_name=engineer["name"] if engineer else None
        )
    
    async def get_application(self, application_id: str) -> Optional[ApplicationResponse]:
        """Get application by ID"""
        app = await self.db.applications.find_one({"application_id": application_id}, {"_id": 0})
        if not app:
            return None
        
        return await self._enrich_application(app)
    
    async def update_application_status(
        self,
        application_id: str,
        founder_id: str,
        data: ApplicationUpdate
    ) -> ApplicationResponse:
        """Update application status (by founder)"""
        app = await self.db.applications.find_one({"application_id": application_id})
        if not app:
            raise ValueError("Application not found")
        
        # Verify founder owns the startup
        startup = await self.db.startups.find_one({"startup_id": app["startup_id"]})
        if not startup or startup["founder_id"] != founder_id:
            raise ValueError("Not authorized to update this application")
        
        update_data = {
            "status": data.status.value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if data.feedback:
            update_data["feedback"] = data.feedback
        if data.interview_date:
            update_data["interview_date"] = data.interview_date.isoformat()
        
        await self.db.applications.update_one(
            {"application_id": application_id},
            {"$set": update_data}
        )
        
        return await self.get_application(application_id)
    
    async def withdraw_application(self, application_id: str, engineer_id: str) -> bool:
        """Withdraw an application"""
        app = await self.db.applications.find_one({"application_id": application_id})
        if not app:
            raise ValueError("Application not found")
        
        if app["engineer_id"] != engineer_id:
            raise ValueError("Not authorized to withdraw this application")
        
        await self.db.applications.update_one(
            {"application_id": application_id},
            {"$set": {
                "status": ApplicationStatus.WITHDRAWN.value,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return True
    
    async def get_engineer_applications(
        self,
        engineer_id: str,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None
    ) -> ApplicationListResponse:
        """Get applications for an engineer"""
        query = {"engineer_id": engineer_id}
        if status:
            query["status"] = status
        
        total = await self.db.applications.count_documents(query)
        
        cursor = self.db.applications.find(query, {"_id": 0})
        cursor = cursor.skip((page - 1) * page_size).limit(page_size)
        cursor = cursor.sort("applied_at", -1)
        
        applications = []
        async for doc in cursor:
            applications.append(await self._enrich_application(doc))
        
        return ApplicationListResponse(
            applications=applications,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total
        )
    
    async def get_role_applications(
        self,
        role_id: str,
        founder_id: str,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None
    ) -> ApplicationListResponse:
        """Get applications for a role (for founders)"""
        # Verify founder owns the role
        role = await self.db.roles.find_one({"role_id": role_id})
        if not role:
            raise ValueError("Role not found")
        
        startup = await self.db.startups.find_one({"startup_id": role["startup_id"]})
        if not startup or startup["founder_id"] != founder_id:
            raise ValueError("Not authorized to view applications for this role")
        
        query = {"role_id": role_id}
        if status:
            query["status"] = status
        
        total = await self.db.applications.count_documents(query)
        
        cursor = self.db.applications.find(query, {"_id": 0})
        cursor = cursor.skip((page - 1) * page_size).limit(page_size)
        cursor = cursor.sort("applied_at", -1)
        
        applications = []
        async for doc in cursor:
            applications.append(await self._enrich_application(doc))
        
        return ApplicationListResponse(
            applications=applications,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total
        )
    
    async def _enrich_application(self, doc: dict) -> ApplicationResponse:
        """Enrich application with related data"""
        role = await self.db.roles.find_one({"role_id": doc["role_id"]}, {"title": 1})
        startup = await self.db.startups.find_one({"startup_id": doc["startup_id"]}, {"name": 1})
        engineer = await self.db.users.find_one({"user_id": doc["engineer_id"]}, {"name": 1})
        
        applied_at = doc["applied_at"]
        if isinstance(applied_at, str):
            applied_at = datetime.fromisoformat(applied_at)
        
        updated_at = doc.get("updated_at")
        if updated_at and isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at)
        
        interview_date = doc.get("interview_date")
        if interview_date and isinstance(interview_date, str):
            interview_date = datetime.fromisoformat(interview_date)
        
        return ApplicationResponse(
            application_id=doc["application_id"],
            role_id=doc["role_id"],
            engineer_id=doc["engineer_id"],
            startup_id=doc["startup_id"],
            cover_letter=doc.get("cover_letter"),
            status=doc["status"],
            match_score=doc.get("match_score"),
            feedback=doc.get("feedback"),
            interview_date=interview_date,
            applied_at=applied_at,
            updated_at=updated_at,
            role_title=role["title"] if role else None,
            startup_name=startup["name"] if startup else None,
            engineer_name=engineer["name"] if engineer else None
        )
