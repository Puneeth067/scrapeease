#!/bin/bash
# backend/scripts/setup.sh

set -e  # Exit on any error

echo "🚀 Setting up ScrapeEase Backend..."

# Check if Python 3.11+ is installed
python_version=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
required_version="3.11"

if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 11) else 1)"; then
    echo "❌ Python 3.11+ is required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version check passed: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Install development dependencies
echo "🛠️ Installing development dependencies..."
pip install pytest pytest-asyncio pytest-cov httpx black isort flake8 mypy

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p data/raw
mkdir -p data/processed
mkdir -p logs

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Run database migrations (if applicable)
# echo "🗄️ Running database migrations..."
# alembic upgrade head

# Run tests to verify setup
echo "🧪 Running tests to verify setup..."
pytest tests/ -v --tb=short

echo "✅ Backend setup completed successfully!"
echo ""
echo "🎉 You can now start the development server with:"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "📚 API documentation will be available at:"
echo "   - Swagger UI: http://localhost:8000/docs"
echo "   - ReDoc: http://localhost:8000/redoc"