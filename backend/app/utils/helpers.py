# backend/app/utils/helpers.py
import hashlib
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
import re
from urllib.parse import urljoin, urlparse

def generate_scrape_id() -> str:
    """Generate a unique ID for scraping sessions"""
    return str(uuid.uuid4())

def generate_content_hash(content: str) -> str:
    """Generate hash for content deduplication"""
    return hashlib.md5(content.encode()).hexdigest()

def clean_filename(filename: str) -> str:
    """Clean filename for safe file system storage"""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Limit length
    if len(filename) > 200:
        filename = filename[:200]
    return filename

def normalize_url(url: str, base_url: str = None) -> str:
    """Normalize and resolve relative URLs"""
    if not url:
        return ""
    
    # If it's already a full URL, return as is
    if url.startswith(('http://', 'https://')):
        return url
    
    # If base_url provided, resolve relative URL
    if base_url:
        return urljoin(base_url, url)
    
    return url

def extract_domain(url: str) -> str:
    """Extract domain from URL"""
    try:
        return urlparse(url).netloc
    except:
        return ""

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text with ellipsis"""
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."

def sanitize_column_name(name: str) -> str:
    """Sanitize column names for better CSV/JSON compatibility"""
    # Remove special characters and replace with underscore
    name = re.sub(r'[^a-zA-Z0-9_]', '_', name)
    # Remove multiple underscores
    name = re.sub(r'_+', '_', name)
    # Remove leading/trailing underscores
    name = name.strip('_')
    # Ensure it's not empty
    if not name:
        name = "column"
    return name

def detect_data_types(data: List[Dict[str, Any]]) -> Dict[str, str]:
    """Detect likely data types for columns"""
    if not data:
        return {}
    
    type_detection = {}
    
    for column in data[0].keys():
        values = [row.get(column) for row in data if row.get(column) is not None]
        
        if not values:
            type_detection[column] = "string"
            continue
        
        # Check if all values are numeric
        numeric_count = 0
        for value in values:
            try:
                float(str(value).replace(',', '').replace('$', '').replace('€', '').replace('£', ''))
                numeric_count += 1
            except:
                pass
        
        if numeric_count / len(values) > 0.8:  # 80% are numeric
            type_detection[column] = "numeric"
        elif any(keyword in column.lower() for keyword in ['url', 'link', 'href']):
            type_detection[column] = "url"
        elif any(keyword in column.lower() for keyword in ['date', 'time', 'created', 'updated']):
            type_detection[column] = "datetime"
        else:
            type_detection[column] = "string"
    
    return type_detection