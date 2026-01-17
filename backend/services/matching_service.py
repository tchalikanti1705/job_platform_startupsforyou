"""
Matching Service - AI-powered candidate-role matching
"""
from typing import List, Dict, Optional
import logging
from datetime import datetime, timezone

from llm import LLMService

logger = logging.getLogger(__name__)


class MatchingService:
    """Service for AI-powered matching between candidates and roles"""
    
    def __init__(self, db, llm_service: Optional[LLMService] = None):
        self.db = db
        self.llm = llm_service
    
    async def calculate_match_score(
        self,
        engineer_profile: dict,
        role: dict
    ) -> float:
        """
        Calculate match score between an engineer and a role.
        Returns a score between 0.0 and 1.0
        """
        # If LLM is available, use AI-powered matching
        if self.llm:
            return await self._ai_match_score(engineer_profile, role)
        
        # Fallback to rule-based matching
        return self._rule_based_match_score(engineer_profile, role)
    
    def _rule_based_match_score(self, engineer: dict, role: dict) -> float:
        """Rule-based matching algorithm"""
        score = 0.0
        weights = {
            "skills": 0.4,
            "experience": 0.3,
            "location": 0.15,
            "work_preference": 0.15
        }
        
        # Skills matching (40%)
        engineer_skills = set(s.lower() for s in engineer.get("skills", []))
        required_skills = set(s.lower() for s in role.get("skills_required", []))
        
        if required_skills:
            skill_match = len(engineer_skills & required_skills) / len(required_skills)
            score += skill_match * weights["skills"]
        else:
            score += weights["skills"]  # No requirements = full score
        
        # Experience matching (30%)
        engineer_exp = engineer.get("experience_years", 0)
        role_level = role.get("experience_level", "mid")
        
        exp_ranges = {
            "intern": (0, 1),
            "junior": (0, 2),
            "mid": (2, 5),
            "senior": (5, 10),
            "lead": (7, 15),
            "principal": (10, 30)
        }
        
        min_exp, max_exp = exp_ranges.get(role_level, (0, 30))
        if min_exp <= engineer_exp <= max_exp:
            score += weights["experience"]
        elif engineer_exp < min_exp:
            # Partial score if close
            diff = min_exp - engineer_exp
            score += max(0, weights["experience"] * (1 - diff / 3))
        else:
            # Over-qualified, still good but slightly lower
            score += weights["experience"] * 0.8
        
        # Location matching (15%)
        if role.get("remote_allowed", True):
            score += weights["location"]
        else:
            engineer_locations = [loc.lower() for loc in engineer.get("preferred_locations", [])]
            role_location = role.get("location", "").lower()
            if role_location in engineer_locations or not engineer_locations:
                score += weights["location"]
            else:
                score += weights["location"] * 0.3
        
        # Work preference matching (15%)
        engineer_pref = engineer.get("work_preference", "any")
        role_remote = role.get("remote_allowed", True)
        
        if engineer_pref == "any":
            score += weights["work_preference"]
        elif engineer_pref == "remote" and role_remote:
            score += weights["work_preference"]
        elif engineer_pref == "onsite" and not role_remote:
            score += weights["work_preference"]
        elif engineer_pref == "hybrid":
            score += weights["work_preference"] * 0.8
        else:
            score += weights["work_preference"] * 0.3
        
        return round(min(1.0, max(0.0, score)), 2)
    
    async def _ai_match_score(self, engineer: dict, role: dict) -> float:
        """AI-powered matching using LLM"""
        prompt = f"""
        Analyze the match between this candidate and job role.
        
        CANDIDATE PROFILE:
        - Skills: {', '.join(engineer.get('skills', []))}
        - Experience: {engineer.get('experience_years', 0)} years
        - Headline: {engineer.get('headline', '')}
        - Work Preference: {engineer.get('work_preference', 'any')}
        
        JOB ROLE:
        - Title: {role.get('title', '')}
        - Required Skills: {', '.join(role.get('skills_required', []))}
        - Experience Level: {role.get('experience_level', '')}
        - Remote Allowed: {role.get('remote_allowed', True)}
        - Description: {role.get('description', '')[:500]}
        
        Return ONLY a number between 0.0 and 1.0 representing the match quality.
        1.0 = perfect match, 0.0 = no match.
        """
        
        try:
            response = await self.llm.generate(prompt, max_tokens=10)
            score = float(response.strip())
            return round(min(1.0, max(0.0, score)), 2)
        except Exception as e:
            logger.error(f"AI matching failed: {e}")
            return self._rule_based_match_score(engineer, role)
    
    async def find_matching_candidates(
        self,
        role_id: str,
        limit: int = 20
    ) -> List[Dict]:
        """Find top matching candidates for a role"""
        role = await self.db.roles.find_one({"role_id": role_id}, {"_id": 0})
        if not role:
            return []
        
        # Get available engineers
        query = {"availability": {"$ne": "not_looking"}}
        
        # Pre-filter by skills if possible
        if role.get("skills_required"):
            query["skills"] = {"$in": role["skills_required"]}
        
        cursor = self.db.engineer_profiles.find(query, {"_id": 0})
        
        candidates = []
        async for engineer in cursor:
            score = await self.calculate_match_score(engineer, role)
            if score >= 0.3:  # Minimum threshold
                candidates.append({
                    **engineer,
                    "match_score": score
                })
        
        # Sort by match score
        candidates.sort(key=lambda x: x["match_score"], reverse=True)
        
        return candidates[:limit]
    
    async def find_matching_roles(
        self,
        engineer_id: str,
        limit: int = 20
    ) -> List[Dict]:
        """Find top matching roles for an engineer"""
        engineer = await self.db.engineer_profiles.find_one(
            {"user_id": engineer_id},
            {"_id": 0}
        )
        if not engineer:
            return []
        
        # Get active roles
        query = {"status": "active"}
        
        # Pre-filter by skills if engineer has skills
        if engineer.get("skills"):
            query["skills_required"] = {"$in": engineer["skills"]}
        
        cursor = self.db.roles.find(query, {"_id": 0})
        
        roles = []
        async for role in cursor:
            score = await self.calculate_match_score(engineer, role)
            if score >= 0.3:  # Minimum threshold
                # Get startup info
                startup = await self.db.startups.find_one(
                    {"startup_id": role["startup_id"]},
                    {"_id": 0, "name": 1, "logo_url": 1}
                )
                roles.append({
                    **role,
                    "match_score": score,
                    "startup_name": startup.get("name") if startup else None,
                    "startup_logo": startup.get("logo_url") if startup else None
                })
        
        # Sort by match score
        roles.sort(key=lambda x: x["match_score"], reverse=True)
        
        return roles[:limit]
    
    async def update_application_match_score(self, application_id: str):
        """Calculate and update match score for an application"""
        app = await self.db.applications.find_one({"application_id": application_id})
        if not app:
            return
        
        engineer = await self.db.engineer_profiles.find_one(
            {"user_id": app["engineer_id"]},
            {"_id": 0}
        )
        role = await self.db.roles.find_one(
            {"role_id": app["role_id"]},
            {"_id": 0}
        )
        
        if engineer and role:
            score = await self.calculate_match_score(engineer, role)
            await self.db.applications.update_one(
                {"application_id": application_id},
                {"$set": {"match_score": score}}
            )
