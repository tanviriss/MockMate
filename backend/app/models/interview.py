from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class InterviewStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)  # UUID string
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_description = Column(String, nullable=False)
    jd_analysis = Column(JSON, nullable=True)  # AI-analyzed JD requirements
    status = Column(Enum(InterviewStatus), default=InterviewStatus.PENDING)
    overall_score = Column(Float, nullable=True)  # Average score across all answers
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="interviews")
    resume = relationship("Resume", back_populates="interviews")
    questions = relationship("Question", back_populates="interview", cascade="all, delete-orphan")
