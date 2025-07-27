# backend/app/api/deps.py
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import time
import logging
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

# Simple in-memory rate limiter
class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(deque)
        self.limits = {
            "scraping": {"max_requests": 10, "window": 60},  # 10 requests per minute
            "download": {"max_requests": 50, "window": 60},  # 50 downloads per minute
            "validation": {"max_requests": 20, "window": 60}  # 20 validations per minute
        }
    
    def is_allowed(self, client_ip: str, endpoint_type: str = "default") -> bool:
        now = time.time()
        limit_config = self.limits.get(endpoint_type, {"max_requests": 30, "window": 60})
        
        # Clean old requests
        client_requests = self.requests[client_ip]
        while client_requests and client_requests[0] < now - limit_config["window"]:
            client_requests.popleft()
        
        # Check if limit exceeded
        if len(client_requests) >= limit_config["max_requests"]:
            return False
        
        # Add current request
        client_requests.append(now)
        return True

rate_limiter = RateLimiter()

def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host

def check_rate_limit(endpoint_type: str = "default"):
    """Rate limiting dependency"""
    def rate_limit_dependency(request: Request):
        client_ip = get_client_ip(request)
        
        if not rate_limiter.is_allowed(client_ip, endpoint_type):
            logger.warning(f"Rate limit exceeded for {client_ip} on {endpoint_type}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )
        
        return True
    
    return rate_limit_dependency

# Dependency for scraping endpoints
def scraping_rate_limit(request: Request = Depends(check_rate_limit("scraping"))):
    return request

# Dependency for download endpoints  
def download_rate_limit(request: Request = Depends(check_rate_limit("download"))):
    return request

# Dependency for validation endpoints
def validation_rate_limit(request: Request = Depends(check_rate_limit("validation"))):
    return request

# Optional authentication (for future use)
security = HTTPBearer(auto_error=False)

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """Optional authentication - returns user info if token is valid, None otherwise"""
    if not credentials:
        return None
    
    # TODO: Implement JWT token validation
    # For now, return None (no authentication required)
    return None

# Request logging dependency
def log_request(request: Request):
    """Log incoming requests for monitoring"""
    client_ip = get_client_ip(request)
    logger.info(f"Request from {client_ip}: {request.method} {request.url.path}")
    return request

# Common dependencies
def get_common_deps(
    request: Request = Depends(log_request),
    user: Optional[dict] = Depends(get_optional_user)
):
    """Common dependencies for all endpoints"""
    return {
        "client_ip": get_client_ip(request),
        "user": user,
        "request": request
    }