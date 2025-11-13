import os
import jwt
import httpx
from typing import Dict, Any
from app.logging_config import logger


def verify_clerk_token(token: str) -> Dict[str, Any]:
    clerk_secret_key = os.getenv("CLERK_SECRET_KEY")

    if not clerk_secret_key:
        raise ValueError("CLERK_SECRET_KEY not set")

    try:
        decoded = jwt.decode(
            token,
            clerk_secret_key,
            algorithms=["RS256", "HS256"],
            options={"verify_signature": False}
        )

        logger.debug(f"Clerk token decoded successfully for user: {decoded.get('sub')}")
        return decoded

    except jwt.ExpiredSignatureError:
        logger.warning("Clerk token has expired")
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid Clerk token: {e}")
        raise ValueError(f"Invalid token: {e}")


async def get_clerk_user(user_id: str) -> Dict[str, Any]:
    clerk_secret_key = os.getenv("CLERK_SECRET_KEY")

    if not clerk_secret_key:
        raise ValueError("CLERK_SECRET_KEY not set")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.clerk.com/v1/users/{user_id}",
            headers={"Authorization": f"Bearer {clerk_secret_key}"}
        )

        if response.status_code != 200:
            logger.error(f"Failed to fetch Clerk user: {response.text}")
            raise ValueError(f"Failed to fetch user from Clerk: {response.status_code}")

        return response.json()
