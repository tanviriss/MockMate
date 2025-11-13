"""
Clerk Authentication Client

Provides Clerk SDK client for verifying user sessions and managing authentication.
"""
import os
from clerk_backend_api import Clerk
from app.logging_config import logger


def get_clerk():
    """
    Get Clerk SDK client instance

    Returns:
        Clerk: Initialized Clerk client

    Raises:
        ValueError: If CLERK_SECRET_KEY environment variable is not set
    """
    clerk_secret_key = os.getenv("CLERK_SECRET_KEY")

    if not clerk_secret_key:
        logger.error("CLERK_SECRET_KEY environment variable is not set")
        raise ValueError(
            "CLERK_SECRET_KEY must be set in environment variables. "
            "Get your secret key from https://dashboard.clerk.com"
        )

    logger.debug("Initializing Clerk client")
    return Clerk(bearer_auth=clerk_secret_key)
