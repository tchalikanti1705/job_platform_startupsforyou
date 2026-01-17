"""
Startup Controller - Handles startup CRUD operations
"""
from datetime import datetime, timezone
from typing import Optional, List
import logging

from schemas.startup import (
    StartupCreate, StartupUpdate, StartupResponse, StartupListResponse,
    generate_startup_id
)

logger = logging.getLogger(__name__)


class StartupController:
    """Controller for startup operations"""
    
    def __init__(self, db):
        self.db = db
    
    async def create_startup(self, founder_id: str, data: StartupCreate) -> StartupResponse:
        """Create a new startup"""
        # Check if founder already has a startup
        existing = await self.db.startups.find_one({"founder_id": founder_id})
        if existing:
            raise ValueError("You already have a startup registered")
        
        startup_id = generate_startup_id()
        now = datetime.now(timezone.utc)
        
        startup_doc = {
            "startup_id": startup_id,
            "founder_id": founder_id,
            "name": data.name,
            "tagline": data.tagline,
            "description": data.description,
            "website": data.website,
            "logo_url": data.logo_url,
            "funding_stage": data.funding_stage.value,
            "team_size": data.team_size.value,
            "tech_stack": data.tech_stack,
            "industry": data.industry,
            "location": data.location,
            "remote_friendly": data.remote_friendly,
            "created_at": now.isoformat(),
            "updated_at": None
        }
        
        await self.db.startups.insert_one(startup_doc)
        
        # Update founder profile with startup_id
        await self.db.founder_profiles.update_one(
            {"user_id": founder_id},
            {"$set": {"startup_id": startup_id, "updated_at": now.isoformat()}}
        )
        
        return StartupResponse(
            startup_id=startup_id,
            founder_id=founder_id,
            **data.model_dump(),
            open_roles_count=0,
            created_at=now
        )
    
    async def get_startup(self, startup_id: str) -> Optional[StartupResponse]:
        """Get startup by ID"""
        startup = await self.db.startups.find_one({"startup_id": startup_id}, {"_id": 0})
        if not startup:
            return None
        
        # Count open roles
        roles_count = await self.db.roles.count_documents({
            "startup_id": startup_id,
            "status": "active"
        })
        
        return self._doc_to_response(startup, roles_count)
    
    async def get_founder_startup(self, founder_id: str) -> Optional[StartupResponse]:
        """Get startup by founder ID"""
        startup = await self.db.startups.find_one({"founder_id": founder_id}, {"_id": 0})
        if not startup:
            return None
        
        roles_count = await self.db.roles.count_documents({
            "startup_id": startup["startup_id"],
            "status": "active"
        })
        
        return self._doc_to_response(startup, roles_count)
    
    async def update_startup(self, startup_id: str, founder_id: str, data: StartupUpdate) -> StartupResponse:
        """Update startup"""
        startup = await self.db.startups.find_one({"startup_id": startup_id})
        if not startup:
            raise ValueError("Startup not found")
        
        if startup["founder_id"] != founder_id:
            raise ValueError("Not authorized to update this startup")
        
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        
        # Convert enums to values
        if "funding_stage" in update_data:
            update_data["funding_stage"] = update_data["funding_stage"].value
        if "team_size" in update_data:
            update_data["team_size"] = update_data["team_size"].value
        
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        await self.db.startups.update_one(
            {"startup_id": startup_id},
            {"$set": update_data}
        )
        
        return await self.get_startup(startup_id)
    
    async def list_startups(
        self,
        page: int = 1,
        page_size: int = 20,
        industry: Optional[str] = None,
        funding_stage: Optional[str] = None,
        remote_friendly: Optional[bool] = None
    ) -> StartupListResponse:
        """List startups with filters"""
        query = {}
        
        if industry:
            query["industry"] = industry
        if funding_stage:
            query["funding_stage"] = funding_stage
        if remote_friendly is not None:
            query["remote_friendly"] = remote_friendly
        
        total = await self.db.startups.count_documents(query)
        
        cursor = self.db.startups.find(query, {"_id": 0})
        cursor = cursor.skip((page - 1) * page_size).limit(page_size)
        cursor = cursor.sort("created_at", -1)
        
        startups = []
        async for doc in cursor:
            roles_count = await self.db.roles.count_documents({
                "startup_id": doc["startup_id"],
                "status": "active"
            })
            startups.append(self._doc_to_response(doc, roles_count))
        
        return StartupListResponse(
            startups=startups,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total
        )
    
    def _doc_to_response(self, doc: dict, roles_count: int = 0) -> StartupResponse:
        """Convert MongoDB document to response model"""
        created_at = doc["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        updated_at = doc.get("updated_at")
        if updated_at and isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at)
        
        return StartupResponse(
            startup_id=doc["startup_id"],
            founder_id=doc["founder_id"],
            name=doc["name"],
            tagline=doc["tagline"],
            description=doc["description"],
            website=doc.get("website"),
            logo_url=doc.get("logo_url"),
            funding_stage=doc["funding_stage"],
            team_size=doc["team_size"],
            tech_stack=doc.get("tech_stack", []),
            industry=doc["industry"],
            location=doc["location"],
            remote_friendly=doc.get("remote_friendly", True),
            open_roles_count=roles_count,
            created_at=created_at,
            updated_at=updated_at
        )
