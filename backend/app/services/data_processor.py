# backend/app/services/data_processor.py
import pandas as pd
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DataProcessor:
    """Handle data cleaning, validation, and export operations"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.raw_dir = os.path.join(data_dir, "raw")
        self.processed_dir = os.path.join(data_dir, "processed")
        
        # Ensure directories exist
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)
    
    def clean_data(self, raw_data: List[Dict[str, Any]]) -> pd.DataFrame:
        """Clean and standardize scraped data"""
        if not raw_data:
            return pd.DataFrame()
        
        df = pd.DataFrame(raw_data)
        
        # Remove completely empty rows
        df = df.dropna(how='all')
        
        # Clean text data
        for col in df.select_dtypes(include=['object']).columns:
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace(['', 'None', 'nan'], None)
        
        # Try to convert numeric columns
        numeric_indicators = ['price', 'cost', 'amount', 'value', 'rating', 'score', 'number', 'count']
        for col in df.columns:
            if any(indicator in col.lower() for indicator in numeric_indicators):
                # Remove currency symbols and convert to numeric
                df[col] = pd.to_numeric(
                    df[col].astype(str).str.replace(r'[^\d.-]', '', regex=True), 
                    errors='ignore'
                )
        
        # Clean URLs
        url_columns = [col for col in df.columns if 'url' in col.lower() or 'link' in col.lower()]
        for col in url_columns:
            df[col] = df[col].apply(self._clean_url)
        
        # Remove duplicate rows
        df = df.drop_duplicates()
        
        return df
    
    def _clean_url(self, url: str) -> Optional[str]:
        """Clean and validate URLs"""
        if pd.isna(url) or not url:
            return None
        
        url = str(url).strip()
        if not url.startswith(('http://', 'https://')):
            return None
        
        return url
    
    def validate_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Validate cleaned data and return quality metrics"""
        if df.empty:
            return {
                "valid": False,
                "error": "No data to validate",
                "metrics": {}
            }
        
        metrics = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "empty_cells": df.isnull().sum().sum(),
            "duplicate_rows": df.duplicated().sum(),
            "data_types": df.dtypes.to_dict(),
            "memory_usage": df.memory_usage(deep=True).sum()
        }
        
        # Calculate completeness
        total_cells = len(df) * len(df.columns)
        completeness = ((total_cells - metrics["empty_cells"]) / total_cells * 100) if total_cells > 0 else 0
        metrics["completeness_percentage"] = round(completeness, 2)
        
        return {
            "valid": True,
            "metrics": metrics
        }
    
    def save_data(self, df: pd.DataFrame, scrape_id: str, formats: List[str] = None) -> Dict[str, str]:
        """Save data in specified formats"""
        if formats is None:
            formats = ['csv', 'json']
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_filename = f"scrape_{scrape_id}_{timestamp}"
        
        saved_files = {}
        
        try:
            # Save CSV
            if 'csv' in formats:
                csv_path = os.path.join(self.processed_dir, f"{base_filename}.csv")
                df.to_csv(csv_path, index=False, encoding='utf-8')
                saved_files['csv'] = csv_path
                logger.info(f"Saved CSV: {csv_path}")
            
            # Save JSON
            if 'json' in formats:
                json_path = os.path.join(self.processed_dir, f"{base_filename}.json")
                df.to_json(json_path, orient='records', indent=2, force_ascii=False)
                saved_files['json'] = json_path
                logger.info(f"Saved JSON: {json_path}")
            
            # Save Excel (optional)
            if 'excel' in formats:
                excel_path = os.path.join(self.processed_dir, f"{base_filename}.xlsx")
                df.to_excel(excel_path, index=False, engine='openpyxl')
                saved_files['excel'] = excel_path
                logger.info(f"Saved Excel: {excel_path}")
            
            return saved_files
            
        except Exception as e:
            logger.error(f"Error saving data: {e}")
            raise
    
    def save_metadata(self, scrape_id: str, metadata: Dict[str, Any]) -> str:
        """Save scraping metadata"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"scrape_{scrape_id}_{timestamp}_metadata.json"
        metadata_path = os.path.join(self.processed_dir, filename)
        
        try:
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, default=str, ensure_ascii=False)
            
            logger.info(f"Saved metadata: {metadata_path}")
            return metadata_path
            
        except Exception as e:
            logger.error(f"Error saving metadata: {e}")
            raise