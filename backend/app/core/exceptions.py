# backend/app/core/exceptions.py
from fastapi import HTTPException
from typing import Optional, Dict, Any

class ScrapeEaseException(Exception):
    """Base exception for ScrapeEase application"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class ValidationError(ScrapeEaseException):
    """Raised when URL or data validation fails"""
    pass

class ScrapingError(ScrapeEaseException):
    """Raised when scraping operation fails"""
    pass

class ProcessingError(ScrapeEaseException):
    """Raised when data processing fails"""
    pass

class FileNotFoundError(ScrapeEaseException):
    """Raised when requested file is not found"""
    pass

class RateLimitError(ScrapeEaseException):
    """Raised when rate limit is exceeded"""
    pass

# HTTP Exception handlers
def validation_exception_handler(message: str, status_code: int = 400) -> HTTPException:
    return HTTPException(status_code=status_code, detail=message)

def scraping_exception_handler(message: str, status_code: int = 500) -> HTTPException:
    return HTTPException(status_code=status_code, detail=message)

def file_exception_handler(message: str, status_code: int = 404) -> HTTPException:
    return HTTPException(status_code=status_code, detail=message)