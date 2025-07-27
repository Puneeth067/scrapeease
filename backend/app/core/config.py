from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ScrapeEase"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Scraping settings
    MAX_PAGES: int = 50
    REQUEST_TIMEOUT: int = 30
    MAX_RETRIES: int = 3
    MAX_ROWS: int = 10000
    
    # File settings
    DATA_DIR: str = "data"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    class Config:
        env_file = ".env"

settings = Settings()