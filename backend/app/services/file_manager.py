# backend/app/services/file_manager.py
import os
import json
import shutil
from typing import List, Dict, Optional, Any
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class FileManager:
    """Handle file operations for scraped data"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        
        # Create directories
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
    
    def find_files_by_scrape_id(self, scrape_id: str) -> Dict[str, List[str]]:
        """Find all files associated with a scrape ID"""
        files = {
            'csv': [],
            'json': [],
            'metadata': [],
            'other': []
        }
        
        pattern = f"scrape_{scrape_id}*"
        
        for file_path in self.processed_dir.glob(pattern):
            if file_path.is_file():
                if file_path.suffix == '.csv':
                    files['csv'].append(str(file_path))
                elif file_path.suffix == '.json' and 'metadata' not in file_path.name:
                    files['json'].append(str(file_path))
                elif 'metadata' in file_path.name:
                    files['metadata'].append(str(file_path))
                else:
                    files['other'].append(str(file_path))
        
        return files
    
    def get_file_path(self, scrape_id: str, file_type: str) -> Optional[str]:
        """Get the path to a specific file type for a scrape ID"""
        files = self.find_files_by_scrape_id(scrape_id)
        
        if file_type in files and files[file_type]:
            return files[file_type][0]  # Return the first match
        
        return None
    
    def delete_scrape_files(self, scrape_id: str) -> List[str]:
        """Delete all files associated with a scrape ID"""
        files = self.find_files_by_scrape_id(scrape_id)
        deleted_files = []
        
        for file_list in files.values():
            for file_path in file_list:
                try:
                    os.remove(file_path)
                    deleted_files.append(os.path.basename(file_path))
                    logger.info(f"Deleted file: {file_path}")
                except Exception as e:
                    logger.error(f"Error deleting file {file_path}: {e}")
        
        return deleted_files
    
    def get_scrape_metadata(self, scrape_id: str) -> Optional[Dict]:
        """Load metadata for a scrape ID"""
        files = self.find_files_by_scrape_id(scrape_id)
        
        if files['metadata']:
            try:
                with open(files['metadata'][0], 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading metadata: {e}")
        
        return None
    
    def list_all_scrapes(self, limit: int = 50) -> List[Dict]:
        """List all scraping sessions with metadata"""
        scrapes = []
        metadata_files = list(self.processed_dir.glob("*_metadata.json"))
        
        # Sort by modification time (newest first)
        metadata_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        
        for metadata_file in metadata_files[:limit]:
            try:
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                    scrapes.append({
                        'scrape_id': metadata.get('scrape_id'),
                        'url': metadata.get('url'),
                        'timestamp': metadata.get('timestamp'),
                        'total_records': metadata.get('total_records', 0),
                        'columns': len(metadata.get('columns', [])),
                        'strategy': metadata.get('strategy', {}).get('type', 'unknown')
                    })
            except Exception as e:
                logger.error(f"Error reading metadata file {metadata_file}: {e}")
                continue
        
        return scrapes
    
    def cleanup_old_files(self, days_old: int = 30) -> int:
        """Clean up files older than specified days"""
        import time
        
        cutoff_time = time.time() - (days_old * 24 * 60 * 60)
        deleted_count = 0
        
        for file_path in self.processed_dir.iterdir():
            if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                try:
                    file_path.unlink()
                    deleted_count += 1
                    logger.info(f"Cleaned up old file: {file_path}")
                except Exception as e:
                    logger.error(f"Error deleting old file {file_path}: {e}")
        
        return deleted_count
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        stats = {
            'total_files': 0,
            'total_size_bytes': 0,
            'file_types': {},
            'oldest_file': None,
            'newest_file': None,
        }
        
        oldest_time = float('inf')
        newest_time = 0
        
        for file_path in self.processed_dir.iterdir():
            if file_path.is_file():
                stats['total_files'] += 1
                file_size = file_path.stat().st_size
                stats['total_size_bytes'] += file_size
                
                # Track file types
                ext = file_path.suffix.lower()
                stats['file_types'][ext] = stats['file_types'].get(ext, 0) + 1
                
                # Track oldest and newest
                mtime = file_path.stat().st_mtime
                if mtime < oldest_time:
                    oldest_time = mtime
                    stats['oldest_file'] = str(file_path.name)
                if mtime > newest_time:
                    newest_time = mtime
                    stats['newest_file'] = str(file_path.name)
        
        # Convert bytes to human readable
        stats['total_size_mb'] = round(stats['total_size_bytes'] / (1024 * 1024), 2)
        
        return stats