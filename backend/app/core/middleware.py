# backend/app/core/middleware.py
import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.logging import request_logger

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests and responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Get client IP
        client_ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        if not client_ip:
            client_ip = request.client.host
        
        # Process request
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            
            # Log request
            request_logger.log_request(
                method=request.method,
                url=str(request.url),
                client_ip=client_ip,
                status_code=response.status_code,
                duration=duration
            )
            
            # Add response headers
            response.headers["X-Process-Time"] = str(duration)
            response.headers["X-Request-ID"] = getattr(request.state, "request_id", "unknown")
            
            return response
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"Request failed: {request.method} {request.url} - {str(e)}")
            
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"},
                headers={
                    "X-Process-Time": str(duration),
                    "X-Error": "true"
                }
            )

class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware for security headers and basic protection"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add security headers
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
        
        for header, value in security_headers.items():
            response.headers[header] = value
        
        return response

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Global error handling middleware"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except Exception as e:
            logger.error(f"Unhandled error in {request.method} {request.url}: {str(e)}", exc_info=True)
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "message": "An unexpected error occurred",
                    "type": "server_error"
                }
            )

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to add unique request IDs"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        import uuid
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response
    