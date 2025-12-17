"""
Real Job Scraper Service
Fetches jobs from free public APIs:
- RemoteOK (remote jobs)
- Arbeitnow (EU/remote jobs)
"""
import httpx
import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Dict, Optional
import hashlib
import re

logger = logging.getLogger(__name__)

# Free public job APIs (no auth required)
REMOTEOK_API = "https://remoteok.com/api"
ARBEITNOW_API = "https://www.arbeitnow.com/api/job-board-api"


def generate_job_id(source: str, external_id: str) -> str:
    """Generate unique job ID from source and external ID"""
    hash_input = f"{source}_{external_id}"
    return f"job_{hashlib.md5(hash_input.encode()).hexdigest()[:12]}"


def extract_skills(text: str) -> List[str]:
    """Extract skills from job description"""
    common_skills = [
        "python", "javascript", "typescript", "react", "vue", "angular", "node.js", "nodejs",
        "java", "c++", "c#", "go", "golang", "rust", "ruby", "php", "swift", "kotlin",
        "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
        "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "jenkins", "ci/cd",
        "git", "linux", "rest api", "graphql", "microservices",
        "machine learning", "ml", "ai", "deep learning", "tensorflow", "pytorch",
        "data analysis", "pandas", "numpy", "data science",
        "html", "css", "sass", "tailwind", "bootstrap",
        "agile", "scrum", "figma", "sketch", "ui/ux",
        "fastapi", "django", "flask", "express", "spring boot",
        "nextjs", "next.js", "gatsby", "webpack", "vite"
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in common_skills:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            normalized = skill.title().replace('.Js', '.js').replace('Ui/Ux', 'UI/UX')
            if normalized not in found_skills:
                found_skills.append(normalized)
    
    return found_skills[:10]


def determine_experience_level(title: str, description: str) -> str:
    """Determine experience level from title and description"""
    text = (title + " " + description).lower()
    
    if any(word in text for word in ["senior", "sr.", "lead", "principal", "staff", "architect"]):
        return "senior"
    elif any(word in text for word in ["junior", "jr.", "entry", "graduate", "intern", "trainee"]):
        return "entry"
    else:
        return "mid"


async def fetch_remoteok_jobs() -> List[Dict]:
    """Fetch jobs from RemoteOK API"""
    jobs = []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                REMOTEOK_API,
                headers={"User-Agent": "RolesForU Job Platform"}
            )
            
            if response.status_code != 200:
                logger.error(f"RemoteOK API error: {response.status_code}")
                return jobs
            
            data = response.json()
            
            # First item is metadata, skip it
            for item in data[1:51]:  # Get up to 50 jobs
                try:
                    job_id = generate_job_id("remoteok", str(item.get("id", "")))
                    
                    # Parse date
                    date_str = item.get("date", "")
                    try:
                        date_posted = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                    except:
                        date_posted = datetime.now(timezone.utc)
                    
                    description = item.get("description", "")
                    title = item.get("position", "Unknown Position")
                    
                    job = {
                        "job_id": job_id,
                        "title": title,
                        "company": item.get("company", "Unknown Company"),
                        "description": description[:2000] if description else "No description available.",
                        "location": item.get("location", "Remote"),
                        "geo": None,
                        "date_posted": date_posted.isoformat(),
                        "application_deadline": None,
                        "skills_required": extract_skills(f"{title} {description}") or item.get("tags", [])[:10],
                        "experience_level": determine_experience_level(title, description),
                        "is_startup": False,
                        "salary_range": item.get("salary", None),
                        "job_type": "full-time",
                        "remote": True,
                        "company_logo": item.get("company_logo", None),
                        "apply_url": item.get("url", item.get("apply_url", "")),
                        "source": "remoteok",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    
                    jobs.append(job)
                    
                except Exception as e:
                    logger.warning(f"Error parsing RemoteOK job: {e}")
                    continue
                    
    except Exception as e:
        logger.error(f"Error fetching RemoteOK jobs: {e}")
    
    logger.info(f"Fetched {len(jobs)} jobs from RemoteOK")
    return jobs


async def fetch_arbeitnow_jobs() -> List[Dict]:
    """Fetch jobs from Arbeitnow API"""
    jobs = []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                ARBEITNOW_API,
                headers={"User-Agent": "RolesForU Job Platform"}
            )
            
            if response.status_code != 200:
                logger.error(f"Arbeitnow API error: {response.status_code}")
                return jobs
            
            data = response.json()
            job_list = data.get("data", [])
            
            for item in job_list[:50]:  # Get up to 50 jobs
                try:
                    job_id = generate_job_id("arbeitnow", item.get("slug", str(item.get("id", ""))))
                    
                    # Parse date
                    date_str = item.get("created_at", "")
                    try:
                        date_posted = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                    except:
                        date_posted = datetime.now(timezone.utc)
                    
                    description = item.get("description", "")
                    title = item.get("title", "Unknown Position")
                    
                    # Determine location
                    location = item.get("location", "")
                    is_remote = item.get("remote", False)
                    if is_remote and not location:
                        location = "Remote"
                    elif is_remote:
                        location = f"{location} (Remote)"
                    
                    job = {
                        "job_id": job_id,
                        "title": title,
                        "company": item.get("company_name", "Unknown Company"),
                        "description": description[:2000] if description else "No description available.",
                        "location": location or "Not specified",
                        "geo": None,
                        "date_posted": date_posted.isoformat(),
                        "application_deadline": None,
                        "skills_required": extract_skills(f"{title} {description}") or item.get("tags", [])[:10],
                        "experience_level": determine_experience_level(title, description),
                        "is_startup": False,
                        "salary_range": None,
                        "job_type": "full-time",
                        "remote": is_remote,
                        "company_logo": None,
                        "apply_url": item.get("url", ""),
                        "source": "arbeitnow",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    
                    jobs.append(job)
                    
                except Exception as e:
                    logger.warning(f"Error parsing Arbeitnow job: {e}")
                    continue
                    
    except Exception as e:
        logger.error(f"Error fetching Arbeitnow jobs: {e}")
    
    logger.info(f"Fetched {len(jobs)} jobs from Arbeitnow")
    return jobs


async def fetch_all_jobs() -> List[Dict]:
    """Fetch jobs from all sources"""
    # Fetch from both sources concurrently
    results = await asyncio.gather(
        fetch_remoteok_jobs(),
        fetch_arbeitnow_jobs(),
        return_exceptions=True
    )
    
    all_jobs = []
    for result in results:
        if isinstance(result, list):
            all_jobs.extend(result)
        elif isinstance(result, Exception):
            logger.error(f"Error fetching jobs: {result}")
    
    logger.info(f"Total jobs fetched: {len(all_jobs)}")
    return all_jobs


async def sync_jobs_to_db(db) -> Dict:
    """Fetch jobs and sync to database"""
    jobs = await fetch_all_jobs()
    
    if not jobs:
        return {"status": "error", "message": "No jobs fetched", "count": 0}
    
    # Clear old jobs and insert new ones
    # (In production, you'd want to upsert instead)
    deleted = await db.jobs.delete_many({"source": {"$in": ["remoteok", "arbeitnow"]}})
    
    if jobs:
        await db.jobs.insert_many(jobs)
    
    return {
        "status": "success",
        "message": f"Synced {len(jobs)} jobs",
        "deleted": deleted.deleted_count,
        "inserted": len(jobs)
    }
