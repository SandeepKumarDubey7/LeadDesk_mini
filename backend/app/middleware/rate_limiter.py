"""
Rate limiting middleware using SlowAPI.
Protects public endpoints from abuse.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Create a limiter instance using client IP for rate limiting
limiter = Limiter(key_func=get_remote_address)
