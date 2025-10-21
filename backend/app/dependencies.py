from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.supabase_client import get_supabase
from app.database import get_db
from app.models.user import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Verify JWT token from Supabase and get current user
    Auto-sync user to local database if not exists

    Usage in routes:
        @app.get("/protected")
        async def protected_route(user = Depends(get_current_user)):
            return {"user_id": user.id}
    """
    token = credentials.credentials
    supabase = get_supabase()

    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        supabase_user = user_response.user

        # Sync user to local database if not exists
        local_user = db.query(User).filter(User.id == supabase_user.id).first()

        if not local_user:
            # Create user in local database
            local_user = User(
                id=supabase_user.id,
                email=supabase_user.email,
                full_name=supabase_user.user_metadata.get("full_name") if supabase_user.user_metadata else None
            )
            db.add(local_user)
            db.commit()
            db.refresh(local_user)

        return supabase_user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
