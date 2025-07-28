# backend/app/services/scraper.py
import aiohttp
import asyncio
import pandas as pd
from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Tuple
from urllib.parse import urljoin, urlparse
import logging
import uuid
from datetime import datetime
import os
import json

logger = logging.getLogger(__name__)

class UniversalScraper:
    """Universal web scraper for extracting tabular data from any website"""
    
    def __init__(self, max_pages: int = 50, timeout: int = 30):
        self.max_pages = max_pages
        self.timeout = timeout
        self.session = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        self.session = aiohttp.ClientSession(
            connector=connector, 
            timeout=timeout,
            headers={
                'User-Agent': 'ScrapeEase/1.0 (Web Scraping Platform)'
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def validate_url(self, url: str) -> Dict[str, any]:
        """Validate if URL is accessible and contains scrapable content"""
        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    return {
                        "valid": False,
                        "error": f"HTTP {response.status}: {response.reason}"
                    }
                
                content = await response.text()
                soup = BeautifulSoup(content, 'html.parser')
                
                # Check for common table structures
                tables = soup.find_all('table')
                lists = soup.find_all(['ul', 'ol'])
                divs_with_classes = soup.find_all('div', class_=True)
                
                potential_data_sources = len(tables) + len(lists) + len(divs_with_classes)
                
                return {
                    "valid": True,
                    "tables_found": len(tables),
                    "lists_found": len(lists),
                    "structured_divs": len(divs_with_classes),
                    "potential_sources": potential_data_sources,
                    "title": soup.title.string if soup.title else "No title"
                }
                
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }
    
    async def detect_data_structure(self, url: str) -> Dict[str, any]:
        """Detect the data structure and suggest extraction strategies"""
        try:
            async with self.session.get(url) as response:
                content = await response.text()
                soup = BeautifulSoup(content, 'html.parser')
                
                strategies = []
                
                # Strategy 1: HTML Tables
                tables = soup.find_all('table')
                if tables:
                    for i, table in enumerate(tables[:3]):  # Analyze first 3 tables
                        rows = table.find_all('tr')
                        if len(rows) > 1:
                            strategies.append({
                                "type": "table",
                                "selector": f"table:nth-of-type({i+1})",
                                "estimated_rows": len(rows),
                                "estimated_columns": len(rows[0].find_all(['th', 'td'])) if rows else 0
                            })
                
                # Strategy 2: List-based data (e.g., product listings)
                common_item_classes = [
                    'product', 'item', 'card', 'listing', 'entry', 'post', 'article'
                ]
                
                for class_name in common_item_classes:
                    items = soup.find_all(class_=lambda x: x and class_name in x.lower())
                    if len(items) > 3:  # Must have multiple items
                        strategies.append({
                            "type": "list_items",
                            "selector": f".{class_name}",
                            "estimated_items": len(items),
                            "sample_content": items[0].get_text()[:100] if items else ""
                        })
                
                # Strategy 3: Structured divs/sections
                sections = soup.find_all(['section', 'article', 'div'], class_=True)
                repeated_classes = {}
                for section in sections:
                    class_str = ' '.join(section.get('class', []))
                    repeated_classes[class_str] = repeated_classes.get(class_str, 0) + 1
                
                for class_str, count in repeated_classes.items():
                    if count > 3:  # Repeated structure
                        strategies.append({
                            "type": "repeated_sections",
                            "selector": f".{class_str.replace(' ', '.')}",
                            "estimated_items": count
                        })
                
                return {
                    "success": True,
                    "strategies": strategies,
                    "recommended_strategy": strategies[0] if strategies else None
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def scrape_table_data(self, url: str, table_selector: str = "table") -> List[Dict]:
        """Scrape data from HTML tables"""
        async with self.session.get(url) as response:
            content = await response.text()
            soup = BeautifulSoup(content, 'html.parser')
            
            table = soup.select_one(table_selector)
            if not table:
                raise ValueError(f"No table found with selector: {table_selector}")
            
            rows = table.find_all('tr')
            if not rows:
                return []
            
            # Extract headers
            header_row = rows[0]
            headers = [th.get_text().strip() for th in header_row.find_all(['th', 'td'])]
            
            # Extract data rows
            data = []
            for row in rows[1:]:
                cells = row.find_all(['td', 'th'])
                row_data = {}
                for i, cell in enumerate(cells):
                    header = headers[i] if i < len(headers) else f"Column_{i+1}"
                    row_data[header] = cell.get_text().strip()
                
                # Add URL if available
                link = row.find('a')
                if link and link.get('href'):
                    row_data['_source_url'] = urljoin(url, link['href'])
                
                data.append(row_data)
            
            return data
    
    async def scrape_list_items(self, url: str, item_selector: str, fields_config: Dict) -> List[Dict]:
        """Scrape data from list-based structures"""
        async with self.session.get(url) as response:
            content = await response.text()
            soup = BeautifulSoup(content, 'html.parser')
            
            items = soup.select(item_selector)
            if not items:
                raise ValueError(f"No items found with selector: {item_selector}")
            
            data = []
            for item in items:
                row_data = {}
                
                # Extract configured fields
                for field_name, field_config in fields_config.items():
                    element = item.select_one(field_config['selector'])
                    if element:
                        if field_config.get('attribute'):
                            row_data[field_name] = element.get(field_config['attribute'], '')
                        else:
                            row_data[field_name] = element.get_text().strip()
                
                # Add source URL
                link = item.find('a')
                if link and link.get('href'):
                    row_data['_source_url'] = urljoin(url, link['href'])
                
                data.append(row_data)
            
            return data
    
    async def scrape_with_pagination(self, base_url: str, strategy: Dict) -> List[Dict]:
        """Scrape data with automatic pagination detection"""
        all_data = []
        current_url = base_url
        page_count = 0
        
        while current_url and page_count < self.max_pages:
            logger.info(f"Scraping page {page_count + 1}: {current_url}")
            
            try:
                # Scrape current page based on strategy
                if strategy['type'] == 'table':
                    page_data = await self.scrape_table_data(current_url, strategy['selector'])
                elif strategy['type'] == 'list_items':
                    page_data = await self.scrape_list_items(
                        current_url, 
                        strategy['selector'], 
                        strategy.get('fields', {})
                    )
                else:
                    break
                
                all_data.extend(page_data)
                
                # Try to find next page
                async with self.session.get(current_url) as response:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Common pagination patterns
                    next_selectors = [
                        'a[rel="next"]',
                        '.next a',
                        '.pagination .next',
                        'a:contains("Next")',
                        'a:contains("→")'
                    ]
                    
                    next_url = None
                    for selector in next_selectors:
                        next_link = soup.select_one(selector)
                        if next_link and next_link.get('href'):
                            next_url = urljoin(current_url, next_link['href'])
                            break
                    
                    current_url = next_url
                    page_count += 1
                    
            except Exception as e:
                logger.error(f"Error scraping page {current_url}: {e}")
                break
        
        return all_data
    
    def clean_and_process_data(self, raw_data: List[Dict]) -> pd.DataFrame:
        """Clean and process the scraped data"""
        if not raw_data:
            return pd.DataFrame()
        
        df = pd.DataFrame(raw_data)
        
        # Remove completely empty rows
        df = df.dropna(how='all')
        
        # Clean text data
        for col in df.select_dtypes(include=['object']).columns:
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace('', None)
        
        # Try to convert numeric columns
        for col in df.columns:
            if col.lower() in ['price', 'cost', 'amount', 'value', 'rating', 'score']:
                # Remove currency symbols and convert to numeric
                df[col] = pd.to_numeric(
                    df[col].astype(str).str.replace(r'[^\d.]', '', regex=True), 
                    errors='ignore'
                )
        
        return df
    
    async def full_scrape(self, url: str, strategy: Optional[Dict] = None) -> Dict:
        """Perform a complete scraping operation"""
        scrape_id = str(uuid.uuid4())
        
        try:
            # Validate URL first
            validation = await self.validate_url(url)
            if not validation['valid']:
                return {
                    "success": False,
                    "error": validation['error'],
                    "scrape_id": scrape_id
                }
            
            # Auto-detect strategy if not provided
            if not strategy:
                detection = await self.detect_data_structure(url)
                if not detection['success'] or not detection['strategies']:
                    return {
                        "success": False,
                        "error": "No suitable data structure detected",
                        "scrape_id": scrape_id
                    }
                strategy = detection['recommended_strategy']
            
            # Perform scraping
            raw_data = await self.scrape_with_pagination(url, strategy)
            
            if not raw_data:
                return {
                    "success": False,
                    "error": "No data extracted",
                    "scrape_id": scrape_id
                }
            
            # Process data
            df = self.clean_and_process_data(raw_data)
            
            # Save data
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"scrape_{scrape_id}_{timestamp}"
            
            os.makedirs("data/raw", exist_ok=True)
            os.makedirs("data/processed", exist_ok=True)
            
            # Save as both CSV and JSON
            csv_path = f"data/processed/{filename}.csv"
            json_path = f"data/processed/{filename}.json"
            
            df.to_csv(csv_path, index=False)
            df.to_json(json_path, orient='records', indent=2)
            
            # Save metadata
            metadata = {
                "scrape_id": scrape_id,
                "url": url,
                "strategy": strategy,
                "timestamp": datetime.now().isoformat(),
                "total_records": len(df),
                "columns": list(df.columns),
                "files": {
                    "csv": csv_path,
                    "json": json_path
                }
            }
            
            metadata_path = f"data/processed/{filename}_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            return {
                "success": True,
                "scrape_id": scrape_id,
                "total_records": len(df),
                "columns": list(df.columns),
                "files": {
                    "csv": csv_path,
                    "json": json_path,
                    "metadata": metadata_path
                },
                "preview": df.head(5).to_dict('records')
            }
            
        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "scrape_id": scrape_id
            }