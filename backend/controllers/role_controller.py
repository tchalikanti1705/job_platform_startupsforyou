"""
Role Controller - Handles job role CRUD operations
"""
from datetime import datetime, timezone
from typing import Optional, List
import logging

from schemas.role import (
    RoleCreate, RoleUpdate, RoleResponse, RoleListResponse, RoleStatus,
    generate_role_id
)

logger = logging.getLogger(__name__)


class RoleController:
    """Controller for role operations"""
    
    def __init__(self, db):
        self.db = db
    
    async def create_role(self, founder_id: str, data: RoleCreate) -> RoleResponse:
        """Create a new role"""
        # Get founder's startup
        startup = await self.db.startups.find_one({"founder_id": founder_id})
        if not startup:
            raise ValueError("You need to create a startup first")
        
        role_id = generate_role_id()
        now = datetime.now(timezone.utc)
        
        role_doc = {
            "role_id": role_id,
            "startup_id": startup["startup_id"],
            "founder_id": founder_id,
            "title": data.title,
            "description": data.description,
            "requirements": data.requirements,
            "nice_to_have": data.nice_to_have,
            "skills_required": data.skills_required,
            "experience_level": data.experience_level.value,
            "employment_type": data.employment_type.value,
            "salary_range": data.salary_range.model_dump() if data.salary_range else None,
            "location": data.location,
            "remote_allowed": data.remote_allowed,
            "visa_sponsorship": data.visa_sponsorship,
            "status": RoleStatus.ACTIVE.value,
            "created_at": now.isoformat(),
            "updated_at": None
        }
        
        await self.db.roles.insert_one(role_doc)
        
        return RoleResponse(
            role_id=role_id,
            startup_id=startup["startup_id"],
            title=data.title,
            description=data.description,
            requirements=data.requirements,
            nice_to_have=data.nice_to_have,
            skills_required=data.skills_required,
            experience_level=data.experience_level,
            employment_type=data.employment_type,
            salary_range=data.salary_range,
            location=data.location,
            remote_allowed=data.remote_allowed,
            visa_sponsorship=data.visa_sponsorship,
            status=RoleStatus.ACTIVE,
            applications_count=0,
            created_at=now,
            startup_name=startup["name"],
            startup_logo=startup.get("logo_url")
        )
    
    async def get_role(self, role_id: str) -> Optional[RoleResponse]:
        """Get role by ID"""
        role = await self.db.roles.find_one({"role_id": role_id}, {"_id": 0})
        if not role:
            return None
        
        # Get startup info
        startup = await self.db.startups.find_one(
            {"startup_id": role["startup_id"]},
            {"_id": 0, "name": 1, "logo_url": 1}
        )
        
        # Count applications
        apps_count = await self.db.applications.count_documents({"role_id": role_id})
        
        return self._doc_to_response(role, apps_count, startup)
    
    async def update_role(self, role_id: str, founder_id: str, data: RoleUpdate) -> RoleResponse:
        """Update role"""
        role = await self.db.roles.find_one({"role_id": role_id})
        if not role:
            raise ValueError("Role not found")
        
        if role["founder_id"] != founder_id:
            raise ValueError("Not authorized to update this role")
        
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        
        # Convert enums to values
        for field in ["experience_level", "employment_type", "status"]:
            if field in update_data:
                update_data[field] = update_data[field].value
        
        if "salary_range" in update_data and update_data["salary_range"]:
            update_data["salary_range"] = update_data["salary_range"].model_dump()
        
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        await self.db.roles.update_one(
            {"role_id": role_id},
            {"$set": update_data}
        )
        
        return await self.get_role(role_id)
    
    async def delete_role(self, role_id: str, founder_id: str) -> bool:
        """Delete (close) a role"""
        role = await self.db.roles.find_one({"role_id": role_id})
        if not role:
            raise ValueError("Role not found")
        
        if role["founder_id"] != founder_id:
            raise ValueError("Not authorized to delete this role")
        
        await self.db.roles.update_one(
            {"role_id": role_id},
            {"$set": {"status": RoleStatus.CLOSED.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return True
    
    async def list_roles(
        self,
        page: int = 1,
        page_size: int = 20,
        startup_id: Optional[str] = None,
        skills: Optional[List[str]] = None,
        experience_level: Optional[str] = None,
        remote_allowed: Optional[bool] = None,
        status: Optional[str] = None
    ) -> RoleListResponse:
        """List roles with filters"""
        query = {}
        
        if status:
            query["status"] = status
        else:
            query["status"] = RoleStatus.ACTIVE.value  # Default to active only
        
        if startup_id:
            query["startup_id"] = startup_id
        if skills:
            query["skills_required"] = {"$in": skills}
        if experience_level:
            query["experience_level"] = experience_level
        if remote_allowed is not None:
            query["remote_allowed"] = remote_allowed
        
        total = await self.db.roles.count_documents(query)
        
        cursor = self.db.roles.find(query, {"_id": 0})
        cursor = cursor.skip((page - 1) * page_size).limit(page_size)
        cursor = cursor.sort("created_at", -1)
        
        roles = []
        async for doc in cursor:
            startup = await self.db.startups.find_one(
                {"startup_id": doc["startup_id"]},
                {"_id": 0, "name": 1, "logo_url": 1}
            )
            apps_count = await self.db.applications.count_documents({"role_id": doc["role_id"]})
            roles.append(self._doc_to_response(doc, apps_count, startup))
        
        return RoleListResponse(
            roles=roles,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total
        )
    
    async def get_startup_roles(self, founder_id: str) -> List[RoleResponse]:
        """Get all roles for a founder's startup"""
        startup = await self.db.startups.find_one({"founder_id": founder_id})
        if not startup:
            return []
        
        cursor = self.db.roles.find(
            {"startup_id": startup["startup_id"]},
            {"_id": 0}
        ).sort("created_at", -1)
        
        roles = []
        async for doc in cursor:
            apps_count = await self.db.applications.count_documents({"role_id": doc["role_id"]})
            roles.append(self._doc_to_response(doc, apps_count, startup))
        
        return roles
    
    def _doc_to_response(self, doc: dict, apps_count: int = 0, startup: dict = None) -> RoleResponse:
        """Convert MongoDB document to response model"""
        created_at = doc["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        updated_at = doc.get("updated_at")
        if updated_at and isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at)
        
        return RoleResponse(
            role_id=doc["role_id"],
            startup_id=doc["startup_id"],
            title=doc["title"],
            description=doc["description"],
            requirements=doc.get("requirements", []),
            nice_to_have=doc.get("nice_to_have", []),
            skills_required=doc.get("skills_required", []),
            experience_level=doc["experience_level"],
            employment_type=doc["employment_type"],
            salary_range=doc.get("salary_range"),
            location=doc["location"],
            remote_allowed=doc.get("remote_allowed", True),
            visa_sponsorship=doc.get("visa_sponsorship", False),
            status=doc["status"],
            applications_count=apps_count,
            created_at=created_at,
            updated_at=updated_at,
            startup_name=startup.get("name") if startup else None,
            startup_logo=startup.get("logo_url") if startup else None
        )
