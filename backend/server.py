from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(
    title="JobHub API",
    description="Job Search & Tracking Platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from routers import (
    auth_router,
    profile_router,
    jobs_router,
    applications_router,
    insights_router
)

app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(applications_router, prefix="/api")
app.include_router(insights_router, prefix="/api")


@app.get("/api")
async def root():
    return {"message": "JobHub API v1.0", "status": "healthy"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check MongoDB connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("Starting JobHub API...")
    
    # Ensure storage directory exists
    storage_path = ROOT_DIR / "storage" / "resumes"
    storage_path.mkdir(parents=True, exist_ok=True)
    logger.info(f"Storage path: {storage_path}")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Clean up on shutdown"""
    logger.info("Shutting down JobHub API...")
    client.close()
