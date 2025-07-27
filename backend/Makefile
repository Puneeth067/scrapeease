# backend/Makefile

.PHONY: help install dev test clean lint format docker-build docker-run

# Default target
help:
	@echo "ScrapeEase Backend - Available Commands:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  install     - Install dependencies and setup environment"
	@echo "  dev         - Start development server"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  test        - Run all tests"
	@echo "  test-cov    - Run tests with coverage report"
	@echo "  lint        - Run linting checks"
	@echo "  format      - Format code with black and isort"
	@echo "  type-check  - Run type checking with mypy"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run Docker container"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean       - Clean temporary files and caches"
	@echo "  logs        - View application logs"

# Setup and installation
install:
	@echo "🚀 Setting up ScrapeEase Backend..."
	python -m venv venv || python3 -m venv venv
	. venv/bin/activate && pip install --upgrade pip
	. venv/bin/activate && pip install -r requirements.txt
	. venv/bin/activate && pip install pytest pytest-asyncio pytest-cov httpx black isort flake8 mypy
	mkdir -p data/raw data/processed logs
	@if [ ! -f .env ]; then cp .env.example .env; echo "📝 Created .env file from template"; fi
	@echo "✅ Setup completed!"

# Development server
dev:
	@echo "🔥 Starting development server..."
	. venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Testing
test:
	@echo "🧪 Running tests..."
	. venv/bin/activate && pytest tests/ -v

test-cov:
	@echo "🧪 Running tests with coverage..."
	. venv/bin/activate && pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html

test-watch:
	@echo "👀 Running tests in watch mode..."
	. venv/bin/activate && pytest-watch tests/ -- -v

# Code quality
lint:
	@echo "🔍 Running linting checks..."
	. venv/bin/activate && flake8 app tests
	. venv/bin/activate && isort --check-only app tests
	. venv/bin/activate && black --check app tests

format:
	@echo "🎨 Formatting code..."
	. venv/bin/activate && isort app tests
	. venv/bin/activate && black app tests

type-check:
	@echo "🔍 Running type checks..."
	. venv/bin/activate && mypy app

# Docker
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t scrapeease-backend .

docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 8000:8000 -v $(PWD)/data:/app/data scrapeease-backend

docker-compose-up:
	@echo "🐳 Starting with Docker Compose..."
	cd .. && docker-compose up --build

docker-compose-down:
	@echo "🐳 Stopping Docker Compose..."
	cd .. && docker-compose down

# Maintenance
clean:
	@echo "🧹 Cleaning up..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf build/
	rm -rf dist/
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/

logs:
	@echo "📋 Viewing application logs..."
	tail -f logs/scrapeease_$(shell date +%Y%m%d).log

# Database operations (if using databases)
migrate:
	@echo "🗄️ Running database migrations..."
	. venv/bin/activate && alembic upgrade head

migrate-create:
	@echo "🗄️ Creating new migration..."
	@read -p "Migration name: " name; \
	. venv/bin/activate && alembic revision --autogenerate -m "$$name"

# Production deployment
deploy-staging:
	@echo "🚀 Deploying to staging..."
	# Add your staging deployment commands here

deploy-prod:
	@echo "🚀 Deploying to production..."
	# Add your production deployment commands here

# Utility commands
check-deps:
	@echo "📦 Checking for outdated dependencies..."
	. venv/bin/activate && pip list --outdated

update-deps:
	@echo "📦 Updating dependencies..."
	. venv/bin/activate && pip install --upgrade -r requirements.txt

security-check:
	@echo "🔒 Running security checks..."
	. venv/bin/activate && pip install safety
	. venv/bin/activate && safety check

# API documentation
docs:
	@echo "📚 API documentation available at:"
	@echo "  - Swagger UI: http://localhost:8000/docs"
	@echo "  - ReDoc: http://localhost:8000/redoc"

# Performance testing
perf-test:
	@echo "⚡ Running performance tests..."
	. venv/bin/activate && pip install locust
	. venv/bin/activate && locust -f tests/performance/locustfile.py