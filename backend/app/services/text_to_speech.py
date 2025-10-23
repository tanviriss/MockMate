"""
Text-to-Speech service using ElevenLabs API
"""
from typing import Optional
from elevenlabs import ElevenLabs
from app.config import settings


class TextToSpeechService:
    """Service for generating speech from text using ElevenLabs"""

    VOICES = {
        "professional_female": "EXAVITQu4vr4xnSDxMaL",  # Sarah - Professional
        "professional_male": "VR6AewLTigWG4xSOukaG",    # Arnold - Professional
        "friendly": "21m00Tcm4TlvDq8ikWAM",              # Rachel - Friendly
        "default": "EXAVITQu4vr4xnSDxMaL"                # Default to Sarah
    }

    def __init__(self):
        """Initialize ElevenLabs client"""
        self.client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)

    async def generate_speech(
        self,
        text: str,
        voice: str = "default",
        model: str = "eleven_turbo_v2"
    ) -> bytes:
        """
        Generate speech from text using ElevenLabs

        Args:
            text: Text to convert to speech
            voice: Voice persona to use (key from VOICES dict or voice_id)
            model: ElevenLabs model to use (eleven_turbo_v2 for speed)

        Returns:
            Audio data as bytes (MP3 format)
        """
        try:
            voice_id = self.VOICES.get(voice, voice)

            # Generate audio using ElevenLabs
            audio_generator = self.client.text_to_speech.convert(
                voice_id=voice_id,
                text=text,
                model_id=model,
                output_format="mp3_44100_128"
            )

            audio_bytes = b""
            for chunk in audio_generator:
                if chunk:
                    audio_bytes += chunk

            return audio_bytes

        except Exception as e:
            raise Exception(f"Error generating speech: {str(e)}")

    async def generate_speech_stream(
        self,
        text: str,
        voice: str = "default",
        model: str = "eleven_turbo_v2"
    ):
        """
        Generate speech from text with streaming (for real-time playback)

        Args:
            text: Text to convert to speech
            voice: Voice persona to use
            model: ElevenLabs model to use

        Yields:
            Audio chunks as bytes
        """
        try:
            voice_id = self.VOICES.get(voice, voice)

            # Generate audio stream
            audio_generator = self.client.text_to_speech.convert(
                voice_id=voice_id,
                text=text,
                model_id=model,
                output_format="mp3_44100_128"
            )

            for chunk in audio_generator:
                if chunk:
                    yield chunk

        except Exception as e:
            raise Exception(f"Error generating speech stream: {str(e)}")

    def get_available_voices(self) -> dict:
        """
        Get list of available voice personas

        Returns:
            Dict of voice names and descriptions
        """
        return {
            "professional_female": {
                "name": "Sarah",
                "description": "Professional female voice, clear and articulate",
                "voice_id": self.VOICES["professional_female"]
            },
            "professional_male": {
                "name": "Arnold",
                "description": "Professional male voice, authoritative and clear",
                "voice_id": self.VOICES["professional_male"]
            },
            "friendly": {
                "name": "Rachel",
                "description": "Friendly and warm voice",
                "voice_id": self.VOICES["friendly"]
            },
            "default": {
                "name": "Sarah (Default)",
                "description": "Default professional female voice",
                "voice_id": self.VOICES["default"]
            }
        }


text_to_speech_service = TextToSpeechService()
