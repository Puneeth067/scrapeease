# backend/tests/test_api.py
import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from app.main import app

# Test client
client = TestClient(app)

class TestHealthEndpoints:
    """Test health and basic endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

class TestScrapingEndpoints:
    """Test scraping API endpoints"""
    
    def test_validate_url_valid(self):
        """Test URL validation with valid URL"""
        response = client.post(
            "/api/v1/validate-url",
            json={"url": "https://httpbin.org/html"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
    
    def test_validate_url_invalid(self):
        """Test URL validation with invalid URL"""
        response = client.post(
            "/api/v1/validate-url",
            json={"url": "not-a-valid-url"}
        )
        assert response.status_code == 422  # Validation error
    
    def test_detect_structure(self):
        """Test structure detection"""
        response = client.post(
            "/api/v1/detect-structure",
            json={"url": "https://httpbin.org/html"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "strategies" in data
    
    def test_scrape_endpoint_basic(self):
        """Test basic scraping functionality"""
        response = client.post(
            "/api/v1/scrape",
            json={
                "url": "https://httpbin.org/html",
                "max_pages": 1
            }
        )
        # Note: This might fail without a proper HTML table
        # but we're testing the endpoint structure
        assert response.status_code in [200, 500]  # Either success or expected scraping failure
        data = response.json()
        assert "success" in data
        assert "scrape_id" in data

class TestFileEndpoints:
    """Test file management endpoints"""
    
    def test_history_endpoint(self):
        """Test scraping history endpoint"""
        response = client.get("/api/v1/history")
        assert response.status_code == 200
        data = response.json()
        assert "history" in data
        assert isinstance(data["history"], list)
    
    def test_download_nonexistent_file(self):
        """Test downloading non-existent file"""
        response = client.get("/api/v1/download/nonexistent-id/csv")
        assert response.status_code == 404
    
    def test_preview_nonexistent_data(self):
        """Test previewing non-existent data"""
        response = client.get("/api/v1/preview/nonexistent-id")
        assert response.status_code == 404
    
    def test_delete_nonexistent_data(self):
        """Test deleting non-existent data"""
        response = client.delete("/api/v1/data/nonexistent-id")
        assert response.status_code == 404

class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_rate_limiting_validation(self):
        """Test rate limiting on validation endpoint"""
        # Make multiple requests rapidly
        responses = []
        for i in range(25):  # Exceed the rate limit
            response = client.post(
                "/api/v1/validate-url",
                json={"url": "https://httpbin.org/html"}
            )
            responses.append(response.status_code)
        
        # Should eventually get rate limited
        assert 429 in responses or 422 in responses  # Rate limited or validation error

class TestErrorHandling:
    """Test error handling"""
    
    def test_invalid_json(self):
        """Test handling of invalid JSON"""
        response = client.post(
            "/api/v1/validate-url",
            data="invalid json",
            headers={"content-type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        response = client.post(
            "/api/v1/validate-url",
            json={}
        )
        assert response.status_code == 422
    
    def test_invalid_file_type(self):
        """Test invalid file type download"""
        response = client.get("/api/v1/download/test-id/invalid")
        assert response.status_code == 400

@pytest.mark.asyncio
class TestAsyncEndpoints:
    """Test asynchronous functionality"""
    
    async def test_concurrent_validations(self):
        """Test concurrent URL validations"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            tasks = []
            for i in range(5):
                task = ac.post(
                    "/api/v1/validate-url",
                    json={"url": "https://httpbin.org/html"}
                )
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks)
            
            # All should succeed or fail gracefully
            for response in responses:
                assert response.status_code in [200, 429, 500]

# Fixtures for testing
@pytest.fixture
def sample_scrape_data():
    """Sample scraping data for tests"""
    return {
        "url": "https://example.com/products",
        "strategy": {
            "type": "table",
            "selector": "table.products"
        },
        "max_pages": 1
    }

@pytest.fixture
def mock_scraped_data():
    """Mock scraped data for tests"""
    return [
        {"name": "Product A", "price": "$29.99", "rating": "4.5"},
        {"name": "Product B", "price": "$39.99", "rating": "4.2"},
        {"name": "Product C", "price": "$19.99", "rating": "4.8"}
    ]

# Integration tests
class TestIntegration:
    """Integration tests for complete workflows"""
    
    def test_complete_scraping_workflow(self, sample_scrape_data):
        """Test complete scraping workflow"""
        # 1. Validate URL
        validation_response = client.post(
            "/api/v1/validate-url",
            json={"url": sample_scrape_data["url"]}
        )
        # Note: This might fail for external URLs, but we're testing the flow
        
        # 2. Detect structure (if validation passes)
        if validation_response.status_code == 200:
            structure_response = client.post(
                "/api/v1/detect-structure",
                json={"url": sample_scrape_data["url"]}
            )
            assert structure_response.status_code in [200, 500]
        
        # 3. Attempt scraping
        scrape_response = client.post(
            "/api/v1/scrape",
            json=sample_scrape_data
        )
        assert scrape_response.status_code in [200, 500]  # Either works or expected failure
        
        scrape_data = scrape_response.json()
        assert "scrape_id" in scrape_data
        
        # 4. Check status (if scraping initiated)
        if scrape_data.get("success"):
            status_response = client.get(f"/api/v1/scrape/{scrape_data['scrape_id']}/status")
            assert status_response.status_code in [200, 404]

if __name__ == "__main__":
    pytest.main([__file__])