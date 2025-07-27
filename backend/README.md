# ScrapeEase Backend

A powerful and flexible web scraping API built with FastAPI that can extract tabular data from any website.

## ✨ Features

* **Universal Scraping** : Automatically detects and extracts tabular data from any website
* **Smart Strategy Detection** : AI-powered detection of optimal scraping strategies
* **Multiple Export Formats** : CSV, JSON, and Excel export options
* **Rate Limiting & Security** : Built-in protection against abuse
* **Real-time Progress** : Track scraping progress with WebSocket support
* **Data Processing** : Automatic data cleaning and validation
* **File Management** : Organized storage and retrieval of scraped data
* **RESTful API** : Clean, well-documented API endpoints
* **Async Architecture** : High-performance asynchronous processing

## 🚀 Quick Start

### Prerequisites

* Python 3.11+
* pip or poetry

### Installation

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd scrapeease/backend
   make install
   ```
2. **Start development server:**
   ```bash
   make dev
   ```
3. **Access API documentation:**
   * Swagger UI: http://localhost:8000/docs
   * ReDoc: http://localhost:8000/redoc

### Using Docker

```bash
# Build and run with Docker
make docker-build
make docker-run

# Or use Docker Compose (from project root)
docker-compose up --build
```

## 📖 API Usage

### 1. Validate URL

```bash
curl -X POST "http://localhost:8000/api/v1/validate-url" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/products"}'
```

### 2. Detect Data Structure

```bash
curl -X POST "http://localhost:8000/api/v1/detect-structure" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/products"}'
```

### 3. Start Scraping

```bash
curl -X POST "http://localhost:8000/api/v1/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/products",
    "max_pages": 5,
    "export_formats": ["csv", "json"]
  }'
```

### 4. Download Results

```bash
curl -O "http://localhost:8000/api/v1/download/{scrape_id}/csv"
```

## 🏗️ Architecture

```
backend/
├── app/
│   ├── api/              # API endpoints
│   ├── core/             # Core configuration
│   ├── models/           # Pydantic models
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── data/                 # Data storage
├── logs/                 # Application logs
└── tests/                # Test suite
```

### Core Components

* **UniversalScraper** : Main scraping engine with auto-detection
* **DataProcessor** : Data cleaning and validation
* **FileManager** : File storage and retrieval
* **Rate Limiter** : Request throttling and protection

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Application Settings
PROJECT_NAME=ScrapeEase
DEBUG=True
ALLOWED_HOSTS=http://localhost:3000

# Scraping Settings
MAX_PAGES=50
REQUEST_TIMEOUT=30
MAX_RETRIES=3

# Rate Limiting
SCRAPING_RATE_LIMIT=10  # requests per minute
DOWNLOAD_RATE_LIMIT=50
```

## 🧪 Testing

```bash
# Run all tests
make test

# Run with coverage
make test-cov

# Run specific test file
pytest tests/test_api.py -v

# Run integration tests
pytest tests/ -m integration
```

## 📊 Monitoring & Logging

* **Health Check** : `GET /health`
* **Metrics** : Built-in request metrics
* **Logs** : Structured logging in `logs/` directory
* **Error Tracking** : Comprehensive error handling

## 🔐 Security Features

* **Rate Limiting** : Prevents API abuse
* **Input Validation** : Pydantic model validation
* **Security Headers** : CORS, CSP, etc.
* **Request Logging** : All requests are logged
* **Error Sanitization** : Sensitive data protection

## 🚀 Deployment

### Production with Docker

```bash
# Build production image
docker build -t scrapeease-backend .

# Run with environment variables
docker run -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e DEBUG=False \
  -v /data:/app/data \
  scrapeease-backend
```

### Using Docker Compose

```bash
# From project root
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables
3. Run with Gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

## 📈 Performance

* **Async Processing** : Non-blocking request handling
* **Connection Pooling** : Efficient HTTP client management
* **Memory Management** : Optimized data processing
* **Caching** : Redis integration for frequently accessed data

## 🛠️ Development Commands

```bash
# Code formatting
make format

# Linting
make lint

# Type checking
make type-check

# Clean up
make clean

# View logs
make logs
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use** :

```bash
   lsof -ti:8000 | xargs kill -9
```

1. **Permission denied on data directory** :

```bash
   chmod 755 data/
```

1. **Virtual environment issues** :

```bash
   rm -rf venv/
   make install
```

### Debug Mode

Set `DEBUG=True` in `.env` for detailed error messages and auto-reload.

## 📚 API Reference

### Endpoints

| Method | Endpoint                           | Description                |
| ------ | ---------------------------------- | -------------------------- |
| POST   | `/api/v1/validate-url`           | Validate URL accessibility |
| POST   | `/api/v1/detect-structure`       | Detect data structure      |
| POST   | `/api/v1/scrape`                 | Start scraping job         |
| GET    | `/api/v1/scrape/{id}/status`     | Get scraping status        |
| GET    | `/api/v1/download/{id}/{format}` | Download results           |
| GET    | `/api/v1/preview/{id}`           | Preview scraped data       |
| GET    | `/api/v1/history`                | Get scraping history       |
| DELETE | `/api/v1/data/{id}`              | Delete scraped data        |

### Response Models

All responses follow consistent JSON structure:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {...},
  "timestamp": "2023-12-01T12:00:00Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dev dependencies: `pip install -r requirements-dev.txt`
4. Make changes and add tests
5. Run tests: `make test`
6. Format code: `make format`
7. Commit changes: `git commit -m 'Add amazing feature'`
8. Push to branch: `git push origin feature/amazing-feature`
9. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

* **Documentation** : Check `/docs` endpoint
* **Issues** : Create GitHub issue
* **Discussions** : GitHub discussions
* **Email** : support@scrapeease.com

---

**ScrapeEase Backend** - Making web scraping simple and powerful! 🚀
