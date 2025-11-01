from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.supabase_client import get_supabase
from app.database import get_db
from app.models.user import User
from app.logging_config import logger

security = HTTPBearer()


class AuthenticatedUser:
    """Wrapper for user with their token"""
    def __init__(self, user, token: str):
        self.user = user
        self.token = token
        # Expose user attributes directly
        self.id = user.id
        self.email = user.email


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AuthenticatedUser:
    """
    Verify JWT token from Supabase and get current user
    Auto-sync user to local database if not exists

    Usage in routes:
        @app.get("/protected")
        async def protected_route(current_user = Depends(get_current_user)):
            return {"user_id": current_user.id, "token": current_user.token}
    """
    token = credentials.credentials
    logger.debug("Authenticating user request")

    supabase = get_supabase()
    logger.debug("Supabase client initialized")

    try:
        # Verify token with Supabase
        logger.debug("Verifying token with Supabase")
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            logger.warning("Invalid token - no user in response")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        supabase_user = user_response.user
        logger.info(f"User authenticated: {supabase_user.email}")

        # Sync user to local database if not exists
        local_user = db.query(User).filter(User.id == supabase_user.id).first()

        if not local_user:
            logger.info(f"Creating new local user: {supabase_user.email}")
            # Create user in local database
            local_user = User(
                id=supabase_user.id,
                email=supabase_user.email,
                full_name=supabase_user.user_metadata.get("full_name") if supabase_user.user_metadata else None
            )
            db.add(local_user)
            db.commit()
            db.refresh(local_user)
            logger.info("Local user created successfully")
        else:
            logger.debug(f"Local user found: {local_user.email}")

        return AuthenticatedUser(supabase_user, token)

    except HTTPException as http_exc:
        logger.warning(f"Authentication failed: {http_exc.detail}")
        raise
    except Exception as e:
        logger.error(f"Authentication error: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
