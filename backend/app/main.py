from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
import os
from app.api.endpoints import scraping_router, files_router

app = FastAPI(
    title="ScrapeEase API",
    description="Web Scraping Platform - Extract tabular data from URLs",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("data", exist_ok=True)
app.mount("/downloads", StaticFiles(directory="data"), name="downloads")

app.include_router(scraping_router, prefix="/api/v1", tags=["scraping"])
app.include_router(files_router, prefix="/api/v1", tags=["files"])

@app.get("/")
async def root():
    return {"message": "Welcome to ScrapeEase API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
