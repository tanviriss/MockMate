from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, TimeoutError as SQLTimeoutError
from app.supabase_client import get_supabase
from app.clerk_client import get_clerk
from app.database import get_db
from app.models.user import User
from app.logging_config import logger
import os

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
    Verify JWT token from Clerk or Supabase and get current user
    Auto-sync user to local database if not exists

    Supports both Clerk (recommended) and Supabase Auth (legacy) tokens.

    Usage in routes:
        @app.get("/protected")
        async def protected_route(current_user = Depends(get_current_user)):
            return {"user_id": current_user.id, "token": current_user.token}
    """
    token = credentials.credentials
    logger.debug("Authenticating user request")

    # Try Clerk authentication first (if CLERK_SECRET_KEY is set)
    if os.getenv("CLERK_SECRET_KEY"):
        try:
            logger.debug("Attempting Clerk authentication")
            clerk = get_clerk()

            # Verify the session token with Clerk
            jwt_verification = clerk.verifyToken(token)

            if jwt_verification and jwt_verification.get("sub"):
                clerk_user_id = jwt_verification["sub"]
                logger.debug(f"Clerk token verified for user: {clerk_user_id}")

                # Get full user details from Clerk
                clerk_user = clerk.users.get(user_id=clerk_user_id)

                if not clerk_user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found in Clerk",
                    )

                logger.info(f"User authenticated via Clerk: {clerk_user.email_addresses[0].email_address if clerk_user.email_addresses else 'No email'}")

                # Create a simplified user object for compatibility
                class ClerkUserAdapter:
                    def __init__(self, clerk_user_data):
                        self.id = clerk_user_data.id
                        email_obj = clerk_user_data.email_addresses[0] if clerk_user_data.email_addresses else None
                        self.email = email_obj.email_address if email_obj else None
                        self.user_metadata = {
                            "full_name": f"{clerk_user_data.first_name or ''} {clerk_user_data.last_name or ''}".strip()
                        }
                        self.created_at = clerk_user_data.created_at

                clerk_user_adapted = ClerkUserAdapter(clerk_user)

                # Try to sync user to local database
                try:
                    local_user = db.query(User).filter(User.id == clerk_user_adapted.id).first()

                    if not local_user:
                        logger.info(f"Creating new local user from Clerk: {clerk_user_adapted.email}")
                        local_user = User(
                            id=clerk_user_adapted.id,
                            email=clerk_user_adapted.email,
                            full_name=clerk_user_adapted.user_metadata.get("full_name")
                        )
                        db.add(local_user)
                        db.commit()
                        db.refresh(local_user)
                        logger.info("Local user created successfully")
                    else:
                        logger.debug(f"Local user found: {local_user.email}")
                except (OperationalError, SQLTimeoutError) as db_error:
                    logger.warning(f"Database unavailable during auth (user will be authenticated without local sync): {db_error}")
                except Exception as db_error:
                    logger.error(f"Unexpected database error during auth: {db_error}")

                return AuthenticatedUser(clerk_user_adapted, token)

        except HTTPException:
            raise
        except Exception as clerk_error:
            logger.warning(f"Clerk authentication failed: {clerk_error}, falling back to Supabase")

    # Fallback to Supabase authentication (legacy)
    try:
        logger.debug("Attempting Supabase authentication")
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            logger.warning("Invalid token - no user in response")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        supabase_user = user_response.user
        logger.info(f"User authenticated via Supabase: {supabase_user.email}")

        # Try to sync user to local database if not exists
        try:
            local_user = db.query(User).filter(User.id == supabase_user.id).first()

            if not local_user:
                logger.info(f"Creating new local user from Supabase: {supabase_user.email}")
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
        except (OperationalError, SQLTimeoutError) as db_error:
            logger.warning(f"Database unavailable during auth (user will be authenticated without local sync): {db_error}")
        except Exception as db_error:
            logger.error(f"Unexpected database error during auth: {db_error}")

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
