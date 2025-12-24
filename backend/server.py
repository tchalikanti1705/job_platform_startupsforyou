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
    title="StartupsForYou API",
    description="Startup Job Platform API",
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
from routers import auth_router, oauth_router

app.include_router(auth_router, prefix="/api")
app.include_router(oauth_router, prefix="/api")


@app.get("/api")
async def root():
    return {"message": "StartupsForYou API v1.0", "status": "healthy"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("Starting StartupsForYou API...")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Clean up on shutdown"""
    logger.info("Shutting down StartupsForYou API...")
    client.close()
