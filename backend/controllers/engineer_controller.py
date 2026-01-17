"""
Engineer Controller - Handles engineer profile operations
"""
from datetime import datetime, timezone
from typing import Optional, List
import logging

from schemas.engineer import (
    EngineerProfileCreate, EngineerProfileUpdate, EngineerProfileResponse,
    EngineerListResponse, generate_engineer_profile_id
)

logger = logging.getLogger(__name__)


class EngineerController:
    """Controller for engineer profile operations"""
    
    def __init__(self, db):
        self.db = db
    
    async def get_profile(self, user_id: str) -> Optional[EngineerProfileResponse]:
        """Get engineer profile by user ID"""
        profile = await self.db.engineer_profiles.find_one({"user_id": user_id}, {"_id": 0})
        if not profile:
            return None
        
        user = await self.db.users.find_one({"user_id": user_id}, {"_id": 0, "name": 1, "avatar_url": 1})
        
        return self._doc_to_response(profile, user)
    
    async def get_profile_by_id(self, profile_id: str) -> Optional[EngineerProfileResponse]:
        """Get engineer profile by profile ID"""
        profile = await self.db.engineer_profiles.find_one({"profile_id": profile_id}, {"_id": 0})
        if not profile:
            return None
        
        user = await self.db.users.find_one({"user_id": profile["user_id"]}, {"_id": 0, "name": 1, "avatar_url": 1})
        
        return self._doc_to_response(profile, user)
    
    async def update_profile(self, user_id: str, data: EngineerProfileUpdate) -> EngineerProfileResponse:
        """Update engineer profile"""
        profile = await self.db.engineer_profiles.find_one({"user_id": user_id})
        if not profile:
            raise ValueError("Profile not found")
        
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        
        # Convert enums to values
        if "availability" in update_data:
            update_data["availability"] = update_data["availability"].value
        if "work_preference" in update_data:
            update_data["work_preference"] = update_data["work_preference"].value
        
        # Convert experience/education to dicts
        if "experience" in update_data:
            update_data["experience"] = [exp.model_dump() for exp in update_data["experience"]]
        if "education" in update_data:
            update_data["education"] = [edu.model_dump() for edu in update_data["education"]]
        
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        await self.db.engineer_profiles.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        # Mark onboarding as completed if profile has required fields
        if update_data.get("headline") and update_data.get("skills"):
            await self.db.users.update_one(
                {"user_id": user_id},
                {"$set": {"onboarding_completed": True}}
            )
        
        return await self.get_profile(user_id)
    
    async def complete_onboarding(self, user_id: str, data: EngineerProfileCreate) -> EngineerProfileResponse:
        """Complete engineer onboarding with full profile"""
        update_data = data.model_dump()
        
        # Convert enums to values
        update_data["availability"] = update_data["availability"].value
        update_data["work_preference"] = update_data["work_preference"].value
        
        # Convert experience/education to dicts
        update_data["experience"] = [exp.model_dump() for exp in update_data["experience"]]
        update_data["education"] = [edu.model_dump() for edu in update_data["education"]]
        
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        await self.db.engineer_profiles.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        # Mark onboarding as completed
        await self.db.users.update_one(
            {"user_id": user_id},
            {"$set": {"onboarding_completed": True}}
        )
        
        return await self.get_profile(user_id)
    
    async def list_engineers(
        self,
        page: int = 1,
        page_size: int = 20,
        skills: Optional[List[str]] = None,
        experience_years_min: Optional[int] = None,
        experience_years_max: Optional[int] = None,
        availability: Optional[str] = None,
        work_preference: Optional[str] = None
    ) -> EngineerListResponse:
        """List engineer profiles with filters (for founders)"""
        query = {"availability": {"$ne": "not_looking"}}  # Only show available engineers
        
        if skills:
            query["skills"] = {"$in": skills}
        if experience_years_min is not None:
            query["experience_years"] = {"$gte": experience_years_min}
        if experience_years_max is not None:
            if "experience_years" in query:
                query["experience_years"]["$lte"] = experience_years_max
            else:
                query["experience_years"] = {"$lte": experience_years_max}
        if availability:
            query["availability"] = availability
        if work_preference:
            query["work_preference"] = work_preference
        
        total = await self.db.engineer_profiles.count_documents(query)
        
        cursor = self.db.engineer_profiles.find(query, {"_id": 0})
        cursor = cursor.skip((page - 1) * page_size).limit(page_size)
        cursor = cursor.sort("updated_at", -1)
        
        engineers = []
        async for doc in cursor:
            user = await self.db.users.find_one(
                {"user_id": doc["user_id"]},
                {"_id": 0, "name": 1, "avatar_url": 1}
            )
            engineers.append(self._doc_to_response(doc, user))
        
        return EngineerListResponse(
            engineers=engineers,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total
        )
    
    async def search_by_skills(self, skills: List[str], limit: int = 10) -> List[EngineerProfileResponse]:
        """Search engineers by skills (for AI matching)"""
        query = {
            "skills": {"$in": skills},
            "availability": {"$ne": "not_looking"}
        }
        
        cursor = self.db.engineer_profiles.find(query, {"_id": 0}).limit(limit)
        
        engineers = []
        async for doc in cursor:
            user = await self.db.users.find_one(
                {"user_id": doc["user_id"]},
                {"_id": 0, "name": 1, "avatar_url": 1}
            )
            engineers.append(self._doc_to_response(doc, user))
        
        return engineers
    
    def _doc_to_response(self, doc: dict, user: dict = None) -> EngineerProfileResponse:
        """Convert MongoDB document to response model"""
        created_at = doc["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        updated_at = doc.get("updated_at")
        if updated_at and isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at)
        
        return EngineerProfileResponse(
            profile_id=doc["profile_id"],
            user_id=doc["user_id"],
            name=user.get("name", doc.get("name", "")) if user else doc.get("name", ""),
            avatar_url=user.get("avatar_url") if user else None,
            headline=doc.get("headline", ""),
            bio=doc.get("bio", ""),
            skills=doc.get("skills", []),
            experience_years=doc.get("experience_years", 0),
            experience=doc.get("experience", []),
            education=doc.get("education", []),
            linkedin_url=doc.get("linkedin_url"),
            github_url=doc.get("github_url"),
            portfolio_url=doc.get("portfolio_url"),
            availability=doc.get("availability", "open_to_opportunities"),
            work_preference=doc.get("work_preference", "any"),
            preferred_locations=doc.get("preferred_locations", []),
            open_to_equity=doc.get("open_to_equity", True),
            match_score=doc.get("match_score"),
            created_at=created_at,
            updated_at=updated_at
        )
