from supabase import create_client
from app.config import settings
import uuid
from app.logging_config import logger


class StorageService:

    BUCKET_NAME = "resumes"
    AUDIO_BUCKET_NAME = "audio-answers"

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
            logger.error(f"Error deleting file: {e}")
            return False

    @staticmethod
    async def upload_audio(file: bytes, filename: str, user_id: str, interview_id: int, user_token: str) -> str:
        """
        Upload audio answer to Supabase Storage

        Args:
            file: Binary audio file content (bytes)
            filename: Original filename
            user_id: User ID for organizing files
            interview_id: Interview ID for organizing files
            user_token: JWT token for authenticated user

        Returns:
            Public URL of uploaded audio file
        """
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        supabase.auth.set_session(user_token, user_token)

        file_ext = filename.split('.')[-1] if '.' in filename else 'mp3'
        unique_filename = f"{user_id}/interview_{interview_id}/{uuid.uuid4()}.{file_ext}"

        content_type_map = {
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "webm": "audio/webm",
            "m4a": "audio/mp4",
            "ogg": "audio/ogg"
        }
        content_type = content_type_map.get(file_ext, "audio/mpeg")

        supabase.storage.from_(StorageService.AUDIO_BUCKET_NAME).upload(
            path=unique_filename,
            file=file,
            file_options={"content-type": content_type}
        )

        public_url = supabase.storage.from_(StorageService.AUDIO_BUCKET_NAME).get_public_url(unique_filename)

        return public_url

    @staticmethod
    async def delete_audio(file_url: str, user_token: str) -> bool:
        """
        Delete audio file from Supabase Storage

        Args:
            file_url: Public URL of the audio file
            user_token: JWT token for authenticated user

        Returns:
            True if deleted successfully
        """
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        supabase.auth.set_session(user_token, user_token)

        try:
            path = file_url.split(f"/object/public/{StorageService.AUDIO_BUCKET_NAME}/")[1]
            supabase.storage.from_(StorageService.AUDIO_BUCKET_NAME).remove([path])
            return True
        except Exception as e:
            logger.error(f"Error deleting audio file: {e}")
            return False
