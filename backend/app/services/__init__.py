# backend/app/services/__init__.py
from .scraper import UniversalScraper
from .data_processor import DataProcessor
from .file_manager import FileManager

__all__ = ["UniversalScraper", "DataProcessor", "FileManager"]