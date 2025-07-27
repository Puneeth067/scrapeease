#backend/app/utils/validators.py
import re
from urllib.parse import urlparse
from typing import Dict, Any, Optional, List
import requests
from pydantic import HttpUrl

class URLValidator:
    """Validate and analyze URLs for scraping compatibility"""
    
    @staticmethod
    def is_valid_url(url: str) -> bool:
        """Check if URL is properly formatted"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except Exception:
            return False
    
    @staticmethod
    def is_scrapable_domain(url: str) -> Dict[str, Any]:
        """Check if domain allows scraping"""
        try:
            domain = urlparse(url).netloc
            
            # Check robots.txt (simplified)
            robots_url = f"{urlparse(url).scheme}://{domain}/robots.txt"
            
            try:
                response = requests.get(robots_url, timeout=5)
                robots_content = response.text if response.status_code == 200 else ""
            except:
                robots_content = ""
            
            # Simple robots.txt parsing
            disallowed_paths = []
            crawl_delay = None
            
            for line in robots_content.split('\n'):
                line = line.strip().lower()
                if line.startswith('disallow:'):
                    path = line.split(':', 1)[1].strip()
                    if path:
                        disallowed_paths.append(path)
                elif line.startswith('crawl-delay:'):
                    try:
                        crawl_delay = float(line.split(':', 1)[1].strip())
                    except:
                        pass
            
            return {
                "scrapable": True,
                "robots_txt": robots_content[:500],  # First 500 chars
                "disallowed_paths": disallowed_paths,
                "crawl_delay": crawl_delay,
                "warnings": []
            }
            
        except Exception as e:
            return {
                "scrapable": True,  # Default to allowing scraping
                "error": str(e),
                "warnings": ["Could not check robots.txt"]
            }

class DataValidator:
    """Validate scraped data quality and structure"""
    
    @staticmethod
    def validate_tabular_data(data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate that data is suitable for tabular export"""
        if not data:
            return {
                "valid": False,
                "error": "No data provided",
                "metrics": {}
            }
        
        # Check structure consistency
        first_keys = set(data[0].keys()) if data else set()
        inconsistent_rows = []
        
        for i, row in enumerate(data):
            if set(row.keys()) != first_keys:
                inconsistent_rows.append(i)
        
        # Calculate metrics
        total_cells = len(data) * len(first_keys) if data else 0
        empty_cells = sum(
            1 for row in data for value in row.values() 
            if value is None or str(value).strip() == ""
        )
        
        metrics = {
            "total_rows": len(data),
            "total_columns": len(first_keys),
            "inconsistent_rows": len(inconsistent_rows),
            "empty_cells": empty_cells,
            "completeness": ((total_cells - empty_cells) / total_cells * 100) if total_cells > 0 else 0
        }
        
        return {
            "valid": len(inconsistent_rows) < len(data) * 0.1,  # Allow 10% inconsistency
            "metrics": metrics,
            "warnings": [
                f"{len(inconsistent_rows)} rows have inconsistent structure"
            ] if inconsistent_rows else []
        }