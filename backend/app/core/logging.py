# backend/app/core/logging.py
import logging
import logging.config
import os
from datetime import datetime

def setup_logging():
    """Configure logging for the application"""
    
    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)
    
    # Get log level from environment
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(lineno)d - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "json": {
                "format": '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
                "datefmt": "%Y-%m-%d %H:%M:%S"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": log_level,
                "formatter": "default",
                "stream": "ext://sys.stdout"
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": log_level,
                "formatter": "detailed",
                "filename": f"logs/scrapeease_{datetime.now().strftime('%Y%m%d')}.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8"
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "detailed", 
                "filename": f"logs/scrapeease_errors_{datetime.now().strftime('%Y%m%d')}.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8"
            }
        },
        "loggers": {
            "": {  # Root logger
                "level": log_level,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "app": {
                "level": log_level,
                "handlers": ["console", "file", "error_file"],
                "propagate": False
            },
            "app.services.scraper": {
                "level": "DEBUG",
                "handlers": ["console", "file"],
                "propagate": False
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn.error": {
                "level": "INFO",
                "handlers": ["console", "error_file"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": "INFO", 
                "handlers": ["file"],
                "propagate": False
            },
            # Suppress noisy third-party loggers
            "urllib3": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False
            },
            "aiohttp": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False
            }
        }
    }
    
    logging.config.dictConfig(logging_config)
    
    # Log startup message
    logger = logging.getLogger("app")
    logger.info("Logging configured successfully")
    logger.info(f"Log level set to: {log_level}")

class RequestLogger:
    """Custom logger for HTTP requests"""
    
    def __init__(self):
        self.logger = logging.getLogger("app.requests")
    
    def log_request(self, method: str, url: str, client_ip: str, status_code: int = None, duration: float = None):
        """Log HTTP request details"""
        message = f"{method} {url} from {client_ip}"
        
        if status_code:
            message += f" -> {status_code}"
        
        if duration:
            message += f" ({duration:.3f}s)"
        
        if status_code and status_code >= 400:
            self.logger.error(message)
        else:
            self.logger.info(message)
    
    def log_scraping_start(self, scrape_id: str, url: str, strategy: str):
        """Log scraping operation start"""
        self.logger.info(f"Scraping started - ID: {scrape_id}, URL: {url}, Strategy: {strategy}")
    
    def log_scraping_complete(self, scrape_id: str, records: int, duration: float):
        """Log scraping operation completion"""
        self.logger.info(f"Scraping completed - ID: {scrape_id}, Records: {records}, Duration: {duration:.2f}s")
    
    def log_scraping_error(self, scrape_id: str, error: str):
        """Log scraping operation error"""
        self.logger.error(f"Scraping failed - ID: {scrape_id}, Error: {error}")

# Global request logger instance
request_logger = RequestLogger()