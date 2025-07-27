# backend/app/models/scraping.py
from pydantic import BaseModel, HttpUrl, Field, validator
from typing import Optional, Dict, List, Any, Union
from datetime import datetime
from enum import Enum

class ScrapeStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress" 
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class StrategyType(str, Enum):
    TABLE = "table"
    LIST_ITEMS = "list_items"
    REPEATED_SECTIONS = "repeated_sections"
    CUSTOM = "custom"

class ExportFormat(str, Enum):
    CSV = "csv"
    JSON = "json"
    EXCEL = "excel"

# Request Models
class UrlValidationRequest(BaseModel):
    url: HttpUrl
    check_robots: Optional[bool] = True
    
    class Config:
        schema_extra = {
            "example": {
                "url": "https://example.com/products",
                "check_robots": True
            }
        }

class FieldConfig(BaseModel):
    selector: str = Field(..., description="CSS selector for the field")
    attribute: Optional[str] = Field(None, description="HTML attribute to extract (text if None)")
    transform: Optional[str] = Field(None, description="Data transformation to apply")
    required: Optional[bool] = False
    
    class Config:
        schema_extra = {
            "example": {
                "selector": ".product-title",
                "attribute": None,
                "transform": "strip",
                "required": True
            }
        }

class ScrapingStrategy(BaseModel):
    type: StrategyType
    selector: str = Field(..., description="Main CSS selector")
    fields: Optional[Dict[str, FieldConfig]] = Field(None, description="Field extraction configuration")
    pagination: Optional[Dict[str, Any]] = Field(None, description="Pagination configuration")
    
    class Config:
        schema_extra = {
            "example": {
                "type": "table",
                "selector": "table.data-table",
                "fields": {
                    "name": {
                        "selector": "td:nth-child(1)",
                        "required": True
                    },
                    "price": {
                        "selector": "td:nth-child(2)", 
                        "transform": "price"
                    }
                }
            }
        }

class ScrapeRequest(BaseModel):
    url: HttpUrl
    strategy: Optional[ScrapingStrategy] = None
    max_pages: Optional[int] = Field(10, ge=1, le=100, description="Maximum pages to scrape")
    fields_config: Optional[Dict[str, FieldConfig]] = None
    export_formats: Optional[List[ExportFormat]] = Field(default_factory=lambda: [ExportFormat.CSV, ExportFormat.JSON])
    filters: Optional[Dict[str, Any]] = Field(None, description="Data filtering options")
    
    @validator('max_pages')
    def validate_max_pages(cls, v):
        if v > 100:
            raise ValueError('Maximum pages cannot exceed 100')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "url": "https://example.com/products",
                "strategy": {
                    "type": "table",
                    "selector": "table.products"
                },
                "max_pages": 5,
                "export_formats": ["csv", "json"]
            }
        }

# Response Models
class ScrapeResponse(BaseModel):
    success: bool
    scrape_id: str
    message: str
    status: Optional[ScrapeStatus] = None
    total_records: Optional[int] = None
    columns: Optional[List[str]] = None
    preview: Optional[List[Dict[str, Any]]] = None
    files: Optional[Dict[str, str]] = None
    error: Optional[str] = None
    warnings: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "scrape_id": "123e4567-e89b-12d3-a456-426614174000",
                "message": "Scraping completed successfully",
                "status": "completed",
                "total_records": 150,
                "columns": ["name", "price", "rating"],
                "files": {
                    "csv": "/api/v1/download/123e4567-e89b-12d3-a456-426614174000/csv",
                    "json": "/api/v1/download/123e4567-e89b-12d3-a456-426614174000/json"
                }
            }
        }

class ValidationResponse(BaseModel):
    valid: bool
    message: str
    url: Optional[str] = None
    tables_found: Optional[int] = None
    lists_found: Optional[int] = None
    structured_divs: Optional[int] = None
    potential_sources: Optional[int] = None
    title: Optional[str] = None
    robots_txt_allowed: Optional[bool] = None
    estimated_data_size: Optional[int] = None
    warnings: Optional[List[str]] = None
    error: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "valid": True,
                "message": "URL is valid and contains scrapable content",
                "tables_found": 1,
                "lists_found": 3,
                "potential_sources": 4,
                "title": "Product Listings",
                "robots_txt_allowed": True
            }
        }

class DetectedStrategy(BaseModel):
    type: StrategyType
    selector: str
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score for this strategy")
    estimated_rows: Optional[int] = None
    estimated_columns: Optional[int] = None
    sample_data: Optional[List[Dict[str, Any]]] = None
    description: Optional[str] = None

class StrategyDetectionResponse(BaseModel):
    success: bool
    url: Optional[str] = None
    strategies: List[DetectedStrategy]
    recommended_strategy: Optional[DetectedStrategy] = None
    analysis_time: Optional[float] = None
    error: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "strategies": [
                    {
                        "type": "table",
                        "selector": "table.data-table",
                        "confidence": 0.95,
                        "estimated_rows": 50,
                        "estimated_columns": 4
                    }
                ],
                "recommended_strategy": {
                    "type": "table", 
                    "selector": "table.data-table",
                    "confidence": 0.95
                }
            }
        }

class ScrapeStatusResponse(BaseModel):
    scrape_id: str
    status: ScrapeStatus
    progress: Optional[float] = Field(None, ge=0.0, le=100.0, description="Progress percentage")
    current_page: Optional[int] = None
    total_pages: Optional[int] = None
    records_scraped: Optional[int] = None
    error_count: Optional[int] = None
    warnings: Optional[List[str]] = None
    estimated_completion: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "scrape_id": "123e4567-e89b-12d3-a456-426614174000",
                "status": "in_progress",
                "progress": 65.5,
                "current_page": 3,
                "total_pages": 5,
                "records_scraped": 98
            }
        }

class HistoryItem(BaseModel):
    scrape_id: str
    url: str
    status: ScrapeStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    total_records: Optional[int] = None
    columns_count: Optional[int] = None
    strategy_type: Optional[StrategyType] = None
    file_size: Optional[int] = None
    error: Optional[str] = None

class HistoryResponse(BaseModel):
    history: List[HistoryItem]
    total_count: Optional[int] = None
    page: Optional[int] = None
    page_size: Optional[int] = None

class PreviewResponse(BaseModel):
    scrape_id: str
    total_records: int
    columns: List[str]
    data_types: Optional[Dict[str, str]] = None
    preview: List[Dict[str, Any]]
    sample_size: int
    quality_metrics: Optional[Dict[str, Any]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "scrape_id": "123e4567-e89b-12d3-a456-426614174000",
                "total_records": 150,
                "columns": ["name", "price", "rating"],
                "preview": [
                    {"name": "Product A", "price": "$29.99", "rating": "4.5"},
                    {"name": "Product B", "price": "$39.99", "rating": "4.2"}
                ],
                "sample_size": 2
            }
        }

class DeleteResponse(BaseModel):
    success: bool
    message: str
    scrape_id: str
    deleted_files: List[str]
    space_freed: Optional[int] = Field(None, description="Space freed in bytes")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Deleted 3 files successfully",
                "scrape_id": "123e4567-e89b-12d3-a456-426614174000",
                "deleted_files": ["data.csv", "data.json", "metadata.json"],
                "space_freed": 1048576
            }
        }
        