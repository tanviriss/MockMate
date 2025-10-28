from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.supabase_client import get_supabase
from app.database import get_db
from app.models.user import User

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
    print(f"🔐 [AUTH] Received token: {token[:30]}..." if len(token) > 30 else f"🔐 [AUTH] Received token: {token}")

    supabase = get_supabase()
    print(f"✅ [AUTH] Supabase client initialized")

    try:
        # Verify token with Supabase
        print(f"🔍 [AUTH] Calling supabase.auth.get_user()...")
        user_response = supabase.auth.get_user(token)
        print(f"📦 [AUTH] Response received: {type(user_response)}")
        print(f"📦 [AUTH] Response content: {user_response}")

        if not user_response or not user_response.user:
            print(f"❌ [AUTH] No user in response - user_response={user_response}, has user={hasattr(user_response, 'user') if user_response else 'None'}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        supabase_user = user_response.user
        print(f"✅ [AUTH] User validated: {supabase_user.email} (ID: {supabase_user.id})")

        # Sync user to local database if not exists
        local_user = db.query(User).filter(User.id == supabase_user.id).first()

        if not local_user:
            print(f"➕ [AUTH] Creating new local user for {supabase_user.email}")
            # Create user in local database
            local_user = User(
                id=supabase_user.id,
                email=supabase_user.email,
                full_name=supabase_user.user_metadata.get("full_name") if supabase_user.user_metadata else None
            )
            db.add(local_user)
            db.commit()
            db.refresh(local_user)
            print(f"✅ [AUTH] Local user created")
        else:
            print(f"✅ [AUTH] Local user found: {local_user.email}")

        print(f"🎉 [AUTH] Authentication successful for {supabase_user.email}")
        return AuthenticatedUser(supabase_user, token)

    except HTTPException as http_exc:
        print(f"❌ [AUTH] HTTP Exception: {http_exc.status_code} - {http_exc.detail}")
        raise
    except Exception as e:
        print(f"❌ [AUTH] Unexpected error: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"❌ [AUTH] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
