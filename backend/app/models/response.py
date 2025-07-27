# backend/app/models/response.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class BaseResponse(BaseModel):
    success: bool
    message: str
    timestamp: datetime = datetime.now()

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
    strategies: List[Dict[str, Any]]
    recommended_strategy: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ScrapeStatusResponse(BaseModel):
    scrape_id: str
    status: str
    metadata: Optional[Dict[str, Any]] = None

class HistoryResponse(BaseModel):
    history: List[Dict[str, Any]]

class PreviewResponse(BaseModel):
    total_records: int
    columns: List[str]
    preview: List[Dict[str, Any]]

class DeleteResponse(BaseModel):
    message: str
    deleted_files: List[str]