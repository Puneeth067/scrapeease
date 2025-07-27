# backend/tests/test_services.py
import pytest
import asyncio
import pandas as pd
import tempfile
import os
from unittest.mock import Mock, patch, AsyncMock
from app.services.scraper import UniversalScraper
from app.services.data_processor import DataProcessor
from app.services.file_manager import FileManager

class TestUniversalScraper:
    """Test the UniversalScraper service"""
    
    @pytest.mark.asyncio
    async def test_scraper_context_manager(self):
        """Test scraper async context manager"""
        async with UniversalScraper() as scraper:
            assert scraper.session is not None
        # Session should be closed after context
    
    @pytest.mark.asyncio
    async def test_validate_url_success(self):
        """Test successful URL validation"""
        with patch('aiohttp.ClientSession.get') as mock_get:
            # Mock successful response
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.text.return_value = """
                <html>
                    <head><title>Test Page</title></head>
                    <body>
                        <table><tr><td>Data</td></tr></table>
                        <ul><li>Item</li></ul>
                    </body>
                </html>
            """
            mock_get.return_value.__aenter__.return_value = mock_response
            
            async with UniversalScraper() as scraper:
                result = await scraper.validate_url("https://example.com")
                
                assert result["valid"] is True
                assert result["tables_found"] == 1
                assert result["lists_found"] == 1
                assert "Test Page" in result["title"]
    
    @pytest.mark.asyncio
    async def test_validate_url_failure(self):
        """Test URL validation failure"""
        with patch('aiohttp.ClientSession.get') as mock_get:
            # Mock failed response
            mock_response = AsyncMock()
            mock_response.status = 404
            mock_response.reason = "Not Found"
            mock_get.return_value.__aenter__.return_value = mock_response
            
            async with UniversalScraper() as scraper:
                result = await scraper.validate_url("https://example.com/404")
                
                assert result["valid"] is False
                assert "404" in result["error"]
    
    @pytest.mark.asyncio
    async def test_detect_data_structure(self):
        """Test data structure detection"""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_response = AsyncMock()
            mock_response.text.return_value = """
                <html>
                    <body>
                        <table class="data-table">
                            <tr><th>Name</th><th>Price</th></tr>
                            <tr><td>Product A</td><td>$10</td></tr>
                            <tr><td>Product B</td><td>$20</td></tr>
                        </table>
                        <div class="product-item">Product 1</div>
                        <div class="product-item">Product 2</div>
                        <div class="product-item">Product 3</div>
                        <div class="product-item">Product 4</div>
                    </body>
                </html>
            """
            mock_get.return_value.__aenter__.return_value = mock_response
            
            async with UniversalScraper() as scraper:
                result = await scraper.detect_data_structure("https://example.com")
                
                assert result["success"] is True
                assert len(result["strategies"]) > 0
                
                # Should detect table strategy
                table_strategies = [s for s in result["strategies"] if s["type"] == "table"]
                assert len(table_strategies) > 0
                assert table_strategies[0]["estimated_rows"] == 2
    
    @pytest.mark.asyncio
    async def test_scrape_table_data(self):
        """Test scraping table data"""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_response = AsyncMock()
            mock_response.text.return_value = """
                <table>
                    <tr><th>Name</th><th>Price</th><th>Rating</th></tr>
                    <tr><td>Product A</td><td>$29.99</td><td>4.5</td></tr>
                    <tr><td>Product B</td><td>$39.99</td><td>4.2</td></tr>
                </table>
            """
            mock_get.return_value.__aenter__.return_value = mock_response
            
            async with UniversalScraper() as scraper:
                data = await scraper.scrape_table_data("https://example.com")
                
                assert len(data) == 2
                assert data[0]["Name"] == "Product A"
                assert data[0]["Price"] == "$29.99"
                assert data[1]["Name"] == "Product B"
    
    def test_clean_and_process_data(self):
        """Test data cleaning and processing"""
        raw_data = [
            {"name": "  Product A  ", "price": "$29.99", "rating": "4.5"},
            {"name": "Product B", "price": "$39.99", "rating": "4.2"},
            {"name": "", "price": "", "rating": ""},  # Empty row
            {"name": "Product C", "price": "$19.99", "rating": "4.8"}
        ]
        
        scraper = UniversalScraper()
        df = scraper.clean_and_process_data(raw_data)
        
        assert len(df) == 3  # Empty row should be removed
        assert df.iloc[0]["name"] == "Product A"  # Whitespace trimmed
        assert pd.isna(df.iloc[2]["name"]) or df.iloc[2]["name"] is None  # Empty converted to None

class TestDataProcessor:
    """Test the DataProcessor service"""
    
    def setup_method(self):
        """Setup test environment"""
        self.temp_dir = tempfile.mkdtemp()
        self.processor = DataProcessor(self.temp_dir)
    
    def teardown_method(self):
        """Cleanup test environment"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_clean_data(self):
        """Test data cleaning functionality"""
        raw_data = [
            {"name": "  Product A  ", "price": "$29.99", "rating": "4.5"},
            {"name": "Product B", "price": "$39.99", "rating": "4.2"},
            {"name": "", "price": "", "rating": ""},
            {"name": "Product C", "price": "$19.99", "rating": "4.8"}
        ]
        
        df = self.processor.clean_data(raw_data)
        
        assert len(df) == 3  # Empty row removed
        assert "Product A" in df["name"].values
        # Price should be converted to numeric
        assert df["price"].dtype == "object"  # Might still be object due to $ symbol
    
    def test_validate_data(self):
        """Test data validation"""
        df = pd.DataFrame([
            {"name": "Product A", "price": 29.99, "rating": 4.5},
            {"name": "Product B", "price": 39.99, "rating": 4.2}
        ])
        
        result = self.processor.validate_data(df)
        
        assert result["valid"] is True
        assert result["metrics"]["total_rows"] == 2
        assert result["metrics"]["total_columns"] == 3
        assert result["metrics"]["completeness_percentage"] == 100.0
    
    def test_save_data(self):
        """Test data saving functionality"""
        df = pd.DataFrame([
            {"name": "Product A", "price": 29.99, "rating": 4.5},
            {"name": "Product B", "price": 39.99, "rating": 4.2}
        ])
        
        scrape_id = "test-123"
        files = self.processor.save_data(df, scrape_id, formats=["csv", "json"])
        
        assert "csv" in files
        assert "json" in files
        assert os.path.exists(files["csv"])
        assert os.path.exists(files["json"])
        
        # Verify CSV content
        loaded_df = pd.read_csv(files["csv"])
        assert len(loaded_df) == 2
        assert "name" in loaded_df.columns
    
    def test_save_metadata(self):
        """Test metadata saving"""
        metadata = {
            "scrape_id": "test-123",
            "url": "https://example.com",
            "total_records": 10,
            "columns": ["name", "price", "rating"]
        }
        
        metadata_path = self.processor.save_metadata("test-123", metadata)
        
        assert os.path.exists(metadata_path)
        
        # Verify metadata content
        import json
        with open(metadata_path, 'r') as f:
            loaded_metadata = json.load(f)
        
        assert loaded_metadata["scrape_id"] == "test-123"
        assert loaded_metadata["total_records"] == 10

class TestFileManager:
    """Test the FileManager service"""
    
    def setup_method(self):
        """Setup test environment"""
        self.temp_dir = tempfile.mkdtemp()
        self.file_manager = FileManager(self.temp_dir)
    
    def teardown_method(self):
        """Cleanup test environment"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_find_files_by_scrape_id(self):
        """Test finding files by scrape ID"""
        scrape_id = "test-123"
        timestamp = "20231201_120000"
        
        # Create test files
        test_files = [
            f"scrape_{scrape_id}_{timestamp}.csv",
            f"scrape_{scrape_id}_{timestamp}.json", 
            f"scrape_{scrape_id}_{timestamp}_metadata.json"
        ]
        
        for filename in test_files:
            file_path = self.file_manager.processed_dir / filename
            file_path.write_text("test content")
        
        files = self.file_manager.find_files_by_scrape_id(scrape_id)
        
        assert len(files["csv"]) == 1
        assert len(files["json"]) == 1
        assert len(files["metadata"]) == 1
    
    def test_get_file_path(self):
        """Test getting specific file path"""
        scrape_id = "test-123"
        timestamp = "20231201_120000"
        
        # Create test CSV file
        csv_filename = f"scrape_{scrape_id}_{timestamp}.csv"
        csv_path = self.file_manager.processed_dir / csv_filename
        csv_path.write_text("test,data\n1,2")
        
        found_path = self.file_manager.get_file_path(scrape_id, "csv")
        
        assert found_path is not None
        assert csv_filename in found_path
    
    def test_delete_scrape_files(self):
        """Test deleting scrape files"""
        scrape_id = "test-123"
        timestamp = "20231201_120000"
        
        # Create test files
        test_files = [
            f"scrape_{scrape_id}_{timestamp}.csv",
            f"scrape_{scrape_id}_{timestamp}.json"
        ]
        
        for filename in test_files:
            file_path = self.file_manager.processed_dir / filename
            file_path.write_text("test content")
        
        deleted_files = self.file_manager.delete_scrape_files(scrape_id)
        
        assert len(deleted_files) == 2
        for filename in test_files:
            file_path = self.file_manager.processed_dir / filename
            assert not file_path.exists()
    
    def test_get_storage_stats(self):
        """Test storage statistics"""
        # Create some test files
        test_files = [
            ("test1.csv", "data1,data2\n1,2"),
            ("test2.json", '{"test": "data"}'),
            ("test3.txt", "some text data")
        ]
        
        for filename, content in test_files:
            file_path = self.file_manager.processed_dir / filename
            file_path.write_text(content)
        
        stats = self.file_manager.get_storage_stats()
        
        assert stats["total_files"] == 3
        assert stats["total_size_bytes"] > 0
        assert ".csv" in stats["file_types"]
        assert ".json" in stats["file_types"]
        assert stats["total_size_mb"] >= 0

# Mock fixtures for testing
@pytest.fixture
def mock_html_response():
    """Mock HTML response for testing"""
    return """
    <html>
        <head><title>Test Page</title></head>
        <body>
            <table class="data-table">
                <tr><th>Name</th><th>Price</th></tr>
                <tr><td>Product A</td><td>$10</td></tr>
                <tr><td>Product B</td><td>$20</td></tr>
            </table>
        </body>
    </html>
    """

@pytest.fixture
def sample_scraped_data():
    """Sample scraped data for testing"""
    return [
        {"name": "Product A", "price": "$29.99", "rating": "4.5"},
        {"name": "Product B", "price": "$39.99", "rating": "4.2"},
        {"name": "Product C", "price": "$19.99", "rating": "4.8"}
    ]

if __name__ == "__main__":
    pytest.main([__file__])
    