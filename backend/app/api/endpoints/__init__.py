# __init__.py
from .scraping import router as scraping_router
from .files import router as files_router

__all__ = ["scraping_router", "files_router"]
