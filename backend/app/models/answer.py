from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    audio_url = Column(String, nullable=True)  # URL to audio recording
    transcript = Column(String, nullable=False)  # Transcribed answer text
    audio_duration_seconds = Column(Float, nullable=True)  # Duration of audio in seconds
    evaluation = Column(JSON, nullable=True)  # AI evaluation with feedback
    score = Column(Float, nullable=True)  # Score out of 10
    answered_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    question = relationship("Question", back_populates="answer")
