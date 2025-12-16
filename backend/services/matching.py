"""
Job matching service - MVP-1 (Rule-based)
Structured for AI integration in Phase 2
"""
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class JobMatcher:
    """
    Rule-based job matching
    
    Future AI Integration Points:
    - Replace calculate_match_score() with embedding-based similarity
    - Add semantic skill matching using sentence-transformers
    """
    
    def __init__(self, embedding_model=None):
        """
        Initialize matcher with optional embedding model for Phase 2
        """
        self.embedding_model = embedding_model  # For future AI integration
    
    def calculate_match_score(
        self,
        user_skills: List[str],
        user_experience_level: Optional[str],
        user_preferred_roles: List[str],
        job: Dict
    ) -> Dict:
        """
        Calculate match score between user profile and job
        
        Returns:
        {
            "match_score": float (0-100),
            "matched_skills": List[str],
            "missing_skills": List[str],
            "why_recommended": str
        }
        """
        result = {
            "match_score": 0.0,
            "matched_skills": [],
            "missing_skills": [],
            "why_recommended": ""
        }
        
        job_skills = [s.lower() for s in job.get("skills_required", [])]
        user_skills_lower = [s.lower() for s in user_skills]
        
        # Skill matching (60% weight)
        matched = []
        missing = []
        for skill in job_skills:
            if skill in user_skills_lower:
                matched.append(skill.title())
            else:
                missing.append(skill.title())
        
        skill_score = 0
        if job_skills:
            skill_score = (len(matched) / len(job_skills)) * 60
        else:
            skill_score = 30  # No required skills = partial match
        
        # Experience level matching (25% weight)
        exp_score = 0
        job_exp = job.get("experience_level", "").lower()
        user_exp = (user_experience_level or "").lower()
        
        exp_mapping = {"entry": 1, "mid": 2, "senior": 3}
        if job_exp and user_exp:
            job_level = exp_mapping.get(job_exp, 2)
            user_level = exp_mapping.get(user_exp, 2)
            
            if job_level == user_level:
                exp_score = 25
            elif abs(job_level - user_level) == 1:
                exp_score = 15
            else:
                exp_score = 5
        else:
            exp_score = 12  # Unknown = partial match
        
        # Role relevance (15% weight)
        role_score = 0
        job_title = job.get("title", "").lower()
        for role in user_preferred_roles:
            if role.lower() in job_title or job_title in role.lower():
                role_score = 15
                break
        if not role_score and user_preferred_roles:
            # Partial match for any related keywords
            role_score = 5
        elif not user_preferred_roles:
            role_score = 7  # No preference = neutral
        
        # Calculate total
        total_score = skill_score + exp_score + role_score
        
        # Generate recommendation reason
        reasons = []
        if len(matched) > 0:
            reasons.append(f"Matches {len(matched)} of your skills")
        if exp_score >= 20:
            reasons.append("Experience level is a good fit")
        if role_score >= 10:
            reasons.append("Aligns with your preferred roles")
        if job.get("is_startup"):
            reasons.append("Startup opportunity")
        if job.get("remote"):
            reasons.append("Remote work available")
        
        result["match_score"] = round(total_score, 1)
        result["matched_skills"] = matched
        result["missing_skills"] = missing[:5]  # Limit missing skills shown
        result["why_recommended"] = ". ".join(reasons) if reasons else "Based on your profile"
        
        return result
    
    def rank_jobs(
        self,
        jobs: List[Dict],
        user_skills: List[str],
        user_experience_level: Optional[str],
        user_preferred_roles: List[str],
        sort_by: str = "best_match"
    ) -> List[Dict]:
        """
        Rank jobs by match score or date
        
        AI Integration Point:
        - Add embedding-based semantic similarity here
        - Use sentence-transformers for better matching
        """
        scored_jobs = []
        
        for job in jobs:
            match_info = self.calculate_match_score(
                user_skills,
                user_experience_level,
                user_preferred_roles,
                job
            )
            
            job_with_score = {**job, **match_info}
            scored_jobs.append(job_with_score)
        
        # Sort based on preference
        if sort_by == "best_match":
            scored_jobs.sort(key=lambda x: (-x["match_score"], x.get("date_posted", "")), reverse=False)
            # Secondary sort by date for ties
            scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        else:  # newest
            scored_jobs.sort(key=lambda x: x.get("date_posted", ""), reverse=True)
        
        return scored_jobs


# Singleton instance
matcher = JobMatcher()


def get_job_matches(
    jobs: List[Dict],
    user_profile: Dict,
    sort_by: str = "best_match"
) -> List[Dict]:
    """Convenience function for job matching"""
    return matcher.rank_jobs(
        jobs=jobs,
        user_skills=user_profile.get("skills", []),
        user_experience_level=user_profile.get("experience_level"),
        user_preferred_roles=user_profile.get("preferred_roles", []),
        sort_by=sort_by
    )
