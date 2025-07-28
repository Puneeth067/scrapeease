# backend/app/api/endpoints/scraping.py
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from typing import Optional, Dict, List
from pydantic import BaseModel, HttpUrl
from app.services.scraper import UniversalScraper
from app.core.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic Models
class UrlValidationRequest(BaseModel):
    url: HttpUrl

class ScrapeRequest(BaseModel):
    url: HttpUrl
    strategy: Optional[Dict] = None
    max_pages: Optional[int] = 10
    fields_config: Optional[Dict] = None

class ScrapeResponse(BaseModel):
    success: bool
    scrape_id: str
    message: str
    total_records: Optional[int] = None
    columns: Optional[List[str]] = None
    preview: Optional[List[Dict]] = None
    files: Optional[Dict] = None
    error: Optional[str] = None

class ValidationResponse(BaseModel):
    valid: bool
    message: str
    tables_found: Optional[int] = None
    lists_found: Optional[int] = None
    potential_sources: Optional[int] = None
    title: Optional[str] = None
    error: Optional[str] = None

class StrategyDetectionResponse(BaseModel):
    success: bool
    strategies: List[Dict]
    recommended_strategy: Optional[Dict] = None
    error: Optional[str] = None

@router.post("/validate-url", response_model=ValidationResponse)
async def validate_url(request: UrlValidationRequest):
    """Validate if a URL is accessible and contains scrapable content"""
    try:
        async with UniversalScraper() as scraper:
            result = await scraper.validate_url(str(request.url))
            
            if result['valid']:
                return ValidationResponse(
                    valid=True,
                    message="URL is valid and contains scrapable content",
                    tables_found=result.get('tables_found'),
                    lists_found=result.get('lists_found'),
                    potential_sources=result.get('potential_sources'),
                    title=result.get('title')
                )
            else:
                return ValidationResponse(
                    valid=False,
                    message="URL validation failed",
                    error=result.get('error')
                )
    except Exception as e:
        logger.error(f"URL validation error: {e}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

@router.post("/detect-structure", response_model=StrategyDetectionResponse)
async def detect_data_structure(request: UrlValidationRequest):
    """Detect data structure and suggest extraction strategies"""
    try:
        async with UniversalScraper() as scraper:
            result = await scraper.detect_data_structure(str(request.url))
            
            return StrategyDetectionResponse(
                success=result['success'],
                strategies=result.get('strategies', []),
                recommended_strategy=result.get('recommended_strategy'),
                error=result.get('error')
            )
    except Exception as e:
        logger.error(f"Structure detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_url(request: ScrapeRequest):
    """Perform web scraping on the provided URL"""
    try:
        max_pages = min(request.max_pages or 10, settings.MAX_PAGES)
        
        async with UniversalScraper(max_pages=max_pages) as scraper:
            result = await scraper.full_scrape(
                url=str(request.url),
                strategy=request.strategy
            )
            
            if result['success']:
                return ScrapeResponse(
                    success=True,
                    scrape_id=result['scrape_id'],
                    message="Scraping completed successfully",
                    total_records=result['total_records'],
                    columns=result['columns'],
                    preview=result['preview'],
                    files=result['files']
                )
            else:
                return ScrapeResponse(
                    success=False,
                    scrape_id=result['scrape_id'],
                    message="Scraping failed",
                    error=result['error']
                )
    except Exception as e:
        logger.error(f"Scraping error: {e}")
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@router.get("/scrape/{scrape_id}/status")
async def get_scrape_status(scrape_id: str):
    """Get the status of a scraping job"""
    try:
        import os
        import json
        
        # Find metadata file
        metadata_files = [f for f in os.listdir("data/processed") 
                         if f.startswith(f"scrape_{scrape_id}") and f.endswith("_metadata.json")]
        
        if not metadata_files:
            raise HTTPException(status_code=404, detail="Scrape job not found")
        
        with open(f"data/processed/{metadata_files[0]}", 'r') as f:
            metadata = json.load(f)
        
        return {
            "scrape_id": scrape_id,
            "status": "completed",
            "metadata": metadata
        }
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@router.get("/history")
async def get_scrape_history(limit: int = Query(default=20, le=100)):
    """Get scraping history"""
    try:
        import os
        import json
        from datetime import datetime
        
        metadata_files = [f for f in os.listdir("data/processed") 
                         if f.endswith("_metadata.json")]
        
        history = []
        for file in sorted(metadata_files, reverse=True)[:limit]:
            try:
                with open(f"data/processed/{file}", 'r') as f:
                    metadata = json.load(f)
                    history.append({
                        "scrape_id": metadata['scrape_id'],
                        "url": metadata['url'],
                        "timestamp": metadata['timestamp'],
                        "total_records": metadata['total_records'],
                        "columns": len(metadata['columns'])
                    })
            except Exception:
                continue
        
        return {"history": history}
    except Exception as e:
        logger.error(f"History fetch error: {e}")
        raise HTTPException(status_code=500, detail=f"History fetch failed: {str(e)}")
    
