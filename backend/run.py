#!/usr/bin/env python3
# backend/run.py

"""
ScrapeEase Backend Server Runner
"""

import os
import sys
import uvicorn
from app.core.config import settings
from app.core.logging import setup_logging

def main():
    """Run the ScrapeEase backend server"""
    
    # Setup logging
    setup_logging()
    
    # Get configuration from environment or use defaults
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "True").lower() == "true"
    workers = int(os.getenv("WORKERS", 1))
    
    print(f"""
🚀 Starting ScrapeEase Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Host: {host}
  Port: {port}
  Environment: {os.getenv('ENVIRONMENT', 'development')}
  Debug: {os.getenv('DEBUG', 'True')}
  Workers: {workers if not reload else 1}
  Reload: {reload}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 API Documentation:
  • Swagger UI: http://{host}:{port}/docs
  • ReDoc: http://{host}:{port}/redoc
  • Health Check: http://{host}:{port}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    """)
    
    # Configure uvicorn
    config = {
        "app": "app.main:app",
        "host": host,
        "port": port,
        "reload": reload,
        "access_log": True,
        "log_level": os.getenv("LOG_LEVEL", "info").lower(),
    }
    
    # Add workers for production
    if not reload and workers > 1:
        config["workers"] = workers
    
    try:
        uvicorn.run(**config)
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

