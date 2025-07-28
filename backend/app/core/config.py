from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ScrapeEase"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server Settings
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    RELOAD: bool = False
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Scraping settings
    MAX_PAGES: int = 50
    REQUEST_TIMEOUT: int = 30
    MAX_RETRIES: int = 3
    MAX_ROWS: int = 10000
    USER_AGENT: str = "ScrapeEase/1.0 (Web Scraping Platform)"
    
    # File settings
    DATA_DIR: str = "data"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    CLEANUP_INTERVAL_DAYS: int = 30
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    SCRAPING_RATE_LIMIT: int = 10
    DOWNLOAD_RATE_LIMIT: int = 50
    VALIDATION_RATE_LIMIT: int = 20
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        extra = "allow"
        case_sensitive = True

settings = Settings()
