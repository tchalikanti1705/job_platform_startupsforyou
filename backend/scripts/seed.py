#!/usr/bin/env python3
"""
Seed script to populate the database with initial job data
Run: python backend/scripts/seed.py
"""
import asyncio
import json
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from dotenv import load_dotenv
load_dotenv(backend_path / '.env')

from motor.motor_asyncio import AsyncIOMotorClient


async def seed_jobs():
    """Seed the jobs collection"""
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"Connected to MongoDB: {db_name}")
    
    # Load seed data
    seed_file = Path(__file__).parent.parent / 'data' / 'seed_jobs.json'
    
    if not seed_file.exists():
        print(f"Seed file not found: {seed_file}")
        return
    
    with open(seed_file, 'r') as f:
        jobs = json.load(f)
    
    print(f"Loaded {len(jobs)} jobs from seed file")
    
    # Clear existing jobs (optional - comment out to append)
    result = await db.jobs.delete_many({})
    print(f"Cleared {result.deleted_count} existing jobs")
    
    # Insert jobs
    if jobs:
        result = await db.jobs.insert_many(jobs)
        print(f"Inserted {len(result.inserted_ids)} jobs")
    
    # Create indexes
    await db.jobs.create_index("job_id", unique=True)
    await db.jobs.create_index("company")
    await db.jobs.create_index("date_posted")
    await db.jobs.create_index("skills_required")
    await db.jobs.create_index("experience_level")
    await db.jobs.create_index("is_startup")
    await db.jobs.create_index([("title", "text"), ("description", "text"), ("company", "text")])
    
    print("Created indexes")
    
    # Create indexes for other collections
    await db.users.create_index("user_id", unique=True)
    await db.users.create_index("email", unique=True)
    await db.profiles.create_index("user_id", unique=True)
    await db.applications.create_index("application_id", unique=True)
    await db.applications.create_index([("user_id", 1), ("job_id", 1)], unique=True)
    await db.resumes.create_index("resume_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    
    print("Created indexes for all collections")
    
    # Verify
    count = await db.jobs.count_documents({})
    print(f"Total jobs in database: {count}")
    
    client.close()
    print("Done!")


if __name__ == "__main__":
    asyncio.run(seed_jobs())
