"""
Text-to-Speech service using ElevenLabs API
"""
from typing import Optional
from elevenlabs import ElevenLabs
from app.config import settings


class TextToSpeechService:
    """Service for generating speech from text using ElevenLabs"""

    VOICES = {
        "professional_female": "21m00Tcm4TlvDq8ikWAM",  # Rachel - Natural & Conversational
        "professional_male": "pNInz6obpgDQGcFmaJgB",    # Adam - Natural Male
        "friendly": "21m00Tcm4TlvDq8ikWAM",              # Rachel - Friendly
        "default": "21m00Tcm4TlvDq8ikWAM"                # Default to Rachel (most natural)
    }

    def __init__(self):
        """Initialize ElevenLabs client"""
        self.client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)

    async def generate_speech(
        self,
        text: str,
        voice: str = "default",
        model: str = "eleven_multilingual_v2",
        timeout: int = 30
    ) -> bytes:
        """
        Generate speech from text using ElevenLabs

        Args:
            text: Text to convert to speech
            voice: Voice persona to use (key from VOICES dict or voice_id)
            model: ElevenLabs model to use (eleven_multilingual_v2 for quality)
            timeout: Timeout in seconds (default: 30)

        Returns:
            Audio data as bytes (MP3 format)
        """
        import asyncio

        try:
            voice_id = self.VOICES.get(voice, voice)

            # Run TTS with timeout
            async def _generate():
                # Generate audio using ElevenLabs with voice settings for natural sound
                loop = asyncio.get_event_loop()
                audio_generator = await loop.run_in_executor(
                    None,
                    lambda: self.client.text_to_speech.convert(
                        voice_id=voice_id,
                        text=text,
                        model_id=model,
                        output_format="mp3_44100_128",
                        voice_settings={
                            "stability": 0.5,
                            "similarity_boost": 0.75,
                            "style": 0.0,
                            "use_speaker_boost": True
                        }
                    )
                )

                audio_bytes = b""
                for chunk in audio_generator:
                    if chunk:
                        audio_bytes += chunk

                return audio_bytes

            audio_bytes = await asyncio.wait_for(_generate(), timeout=timeout)
            return audio_bytes

        except asyncio.TimeoutError:
            raise Exception(f"Text-to-speech timeout after {timeout} seconds. Text may be too long.")
        except Exception as e:
            raise Exception(f"Error generating speech: {str(e)}")

    async def generate_speech_stream(
        self,
        text: str,
        voice: str = "default",
        model: str = "eleven_multilingual_v2"
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

            # Generate audio stream with voice settings
            audio_generator = self.client.text_to_speech.convert(
                voice_id=voice_id,
                text=text,
                model_id=model,
                output_format="mp3_44100_128",
                voice_settings={
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
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
                "name": "Rachel",
                "description": "Natural, conversational female voice - sounds human",
                "voice_id": self.VOICES["professional_female"]
            },
            "professional_male": {
                "name": "Adam",
                "description": "Natural, warm male voice - sounds human",
                "voice_id": self.VOICES["professional_male"]
            },
            "friendly": {
                "name": "Rachel",
                "description": "Friendly and natural voice",
                "voice_id": self.VOICES["friendly"]
            },
            "default": {
                "name": "Rachel (Default)",
                "description": "Default natural voice - most human-sounding",
                "voice_id": self.VOICES["default"]
            }
        }


text_to_speech_service = TextToSpeechService()
