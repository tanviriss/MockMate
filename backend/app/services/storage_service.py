from supabase import create_client
from app.config import settings
import uuid


class StorageService:

    BUCKET_NAME = "resumes"

    @staticmethod
    async def upload_resume(file: bytes, filename: str, user_id: str, user_token: str) -> str:
        """
        Upload resume PDF to Supabase Storage

        Args:
            file: Binary file content (bytes)
            filename: Original filename
            user_id: User ID for organizing files
            user_token: JWT token for authenticated user

        Returns:
            Public URL of uploaded file
        """
        # Create authenticated Supabase client with user's token
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        supabase.auth.set_session(user_token, user_token)

        file_ext = filename.split('.')[-1]
        unique_filename = f"{user_id}/{uuid.uuid4()}.{file_ext}"

        supabase.storage.from_(StorageService.BUCKET_NAME).upload(
            path=unique_filename,
            file=file,
            file_options={"content-type": "application/pdf"}
        )

        public_url = supabase.storage.from_(StorageService.BUCKET_NAME).get_public_url(unique_filename)

        return public_url

    @staticmethod
    async def delete_resume(file_url: str, user_token: str) -> bool:
        """
        Delete resume from Supabase Storage

        Args:
            file_url: Public URL of the file
            user_token: JWT token for authenticated user

        Returns:
            True if deleted successfully
        """
        # Create authenticated Supabase client with user's token
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        supabase.auth.set_session(user_token, user_token)

        try:
            path = file_url.split(f"/object/public/{StorageService.BUCKET_NAME}/")[1]
            supabase.storage.from_(StorageService.BUCKET_NAME).remove([path])
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
