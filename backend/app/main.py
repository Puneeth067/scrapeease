from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import scraping, files
from app.core.config import settings
import os

app = FastAPI(
    title="ScrapeEase API",
    description="Web Scraping Platform - Extract tabular data from URLs",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
os.makedirs("data", exist_ok=True)
app.mount("/downloads", StaticFiles(directory="data"), name="downloads")

# Include routers
app.include_router(scraping.router, prefix="/api/v1", tags=["scraping"])
app.include_router(files.router, prefix="/api/v1", tags=["files"])

@app.get("/")
async def root():
    return {"message": "Welcome to ScrapeEase API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}