"""
Interview session state management with Redis
"""
import json
import redis
from typing import Optional, Dict, Any
from datetime import datetime
from app.config import settings


class InterviewSession:
    """Represents an active interview session"""

    def __init__(self, interview_id: int, user_id: str):
        self.interview_id = interview_id
        self.user_id = user_id
        self.current_question_index = 0
        self.start_time = datetime.utcnow().isoformat()
        self.answers = []
        self.status = "active"

    def to_dict(self) -> Dict[str, Any]:
        """Convert session to dictionary"""
        return {
            "interview_id": self.interview_id,
            "user_id": self.user_id,
            "current_question_index": self.current_question_index,
            "start_time": self.start_time,
            "answers": self.answers,
            "status": self.status
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "InterviewSession":
        """Create session from dictionary"""
        session = cls(
            interview_id=data["interview_id"],
            user_id=data["user_id"]
        )
        session.current_question_index = data["current_question_index"]
        session.start_time = data["start_time"]
        session.answers = data.get("answers", [])
        session.status = data.get("status", "active")
        return session


class SessionManager:
    """Manages interview sessions in Redis"""

    def __init__(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
        except Exception as e:
            print(f"Warning: Redis connection failed: {e}")
            self.redis_client = None

    def _get_session_key(self, session_id: str) -> str:
        """Get Redis key for session"""
        return f"interview_session:{session_id}"

    def create_session(self, session_id: str, interview_id: int, user_id: str) -> InterviewSession:
        """
        Create a new interview session

        Args:
            session_id: Unique session identifier (usually socket ID)
            interview_id: Database interview ID
            user_id: User ID

        Returns:
            InterviewSession object
        """
        session = InterviewSession(interview_id=interview_id, user_id=user_id)

        if self.redis_client:
            key = self._get_session_key(session_id)
            # Store session with 2 hour TTL
            self.redis_client.setex(
                key,
                7200,  # 2 hours in seconds
                json.dumps(session.to_dict())
            )

        return session

    def get_session(self, session_id: str) -> Optional[InterviewSession]:
        """
        Get session by ID

        Args:
            session_id: Session identifier

        Returns:
            InterviewSession or None if not found
        """
        if not self.redis_client:
            return None

        key = self._get_session_key(session_id)
        data = self.redis_client.get(key)

        if data:
            return InterviewSession.from_dict(json.loads(data))

        return None

    def update_session(self, session_id: str, session: InterviewSession):
        """
        Update session in Redis

        Args:
            session_id: Session identifier
            session: InterviewSession object
        """
        if not self.redis_client:
            return

        key = self._get_session_key(session_id)
        # Update with 2 hour TTL
        self.redis_client.setex(
            key,
            7200,
            json.dumps(session.to_dict())
        )

    def delete_session(self, session_id: str):
        """
        Delete session from Redis

        Args:
            session_id: Session identifier
        """
        if not self.redis_client:
            return

        key = self._get_session_key(session_id)
        self.redis_client.delete(key)

    def advance_question(self, session_id: str) -> bool:
        """
        Move to next question

        Args:
            session_id: Session identifier

        Returns:
            True if successful
        """
        session = self.get_session(session_id)
        if session:
            session.current_question_index += 1
            self.update_session(session_id, session)
            return True
        return False

    def add_answer(self, session_id: str, question_id: int, answer_data: Dict[str, Any]) -> bool:
        """
        Add answer to session

        Args:
            session_id: Session identifier
            question_id: Question ID
            answer_data: Answer data (transcript, audio_url, etc.)

        Returns:
            True if successful
        """
        session = self.get_session(session_id)
        if session:
            answer_record = {
                "question_id": question_id,
                "timestamp": datetime.utcnow().isoformat(),
                **answer_data
            }
            session.answers.append(answer_record)
            self.update_session(session_id, session)
            return True
        return False

    def complete_session(self, session_id: str) -> bool:
        """
        Mark session as completed

        Args:
            session_id: Session identifier

        Returns:
            True if successful
        """
        session = self.get_session(session_id)
        if session:
            session.status = "completed"
            self.update_session(session_id, session)
            return True
        return False


session_manager = SessionManager()
