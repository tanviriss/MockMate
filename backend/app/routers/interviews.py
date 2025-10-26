from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user
from app.models.interview import Interview, InterviewStatus
from app.models.resume import Resume
from app.models.question import Question
from app.services.interview_service import analyze_job_description, generate_interview_questions
from app.services.company_research_service import generate_company_specific_questions

router = APIRouter(prefix="/interviews", tags=["Interviews"])


class CreateInterviewRequest(BaseModel):
    resume_id: int
    job_description: str
    num_questions: int = 10
    target_company: str = None  
    target_role: str = None 


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_interview(
    request: CreateInterviewRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new interview by analyzing JD and generating questions
    """
    try:
        # Get resume
        resume = db.query(Resume).filter(
            Resume.id == request.resume_id,
            Resume.user_id == current_user.id
        ).first()

        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )

        # Analyze job description
        jd_analysis = await analyze_job_description(request.job_description)

        # Generate interview questions (company-specific if provided)
        if request.target_company and request.target_role:
            questions = await generate_company_specific_questions(
                company_name=request.target_company,
                role=request.target_role,
                resume_data=resume.parsed_data,
                jd_analysis=jd_analysis,
                num_questions=request.num_questions
            )
        else:
            questions = await generate_interview_questions(
                resume.parsed_data,
                jd_analysis,
                request.num_questions
            )

        # Create interview record
        interview = Interview(
            user_id=current_user.id,
            resume_id=request.resume_id,
            job_description=request.job_description,
            jd_analysis=jd_analysis,
            target_company=request.target_company,
            status=InterviewStatus.PENDING
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)

        # Save questions to database
        try:
            for idx, question_data in enumerate(questions):
                # Handle both formats: object with question_text key or direct text
                question_text = question_data.get("question_text") if isinstance(question_data, dict) else str(question_data)

                if not question_text:
                    raise ValueError(f"Question {idx} missing question_text: {question_data}")

                question = Question(
                    interview_id=interview.id,
                    question_text=question_text,
                    question_context=question_data if isinstance(question_data, dict) else {"question_text": question_text},
                    order_number=idx
                )
                db.add(question)

            db.commit()

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save questions: {str(e)}"
            )

        return {
            "id": interview.id,
            "resume_id": interview.resume_id,
            "job_description": interview.job_description,
            "jd_analysis": interview.jd_analysis,
            "questions": questions,
            "status": interview.status,
            "created_at": interview.created_at,
            "message": "Interview created successfully!"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create interview: {str(e)}"
        )


@router.get("/")
async def list_interviews(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all interviews for the current user"""
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()

    return {
        "count": len(interviews),
        "interviews": [
            {
                "id": i.id,
                "resume_id": i.resume_id,
                "job_description": i.job_description[:100] + "..." if len(i.job_description) > 100 else i.job_description,
                "jd_analysis": i.jd_analysis,
                "status": i.status,
                "overall_score": i.overall_score,
                "created_at": i.created_at,
                "completed_at": i.completed_at
            }
            for i in interviews
        ]
    }


@router.get("/{interview_id}")
async def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific interview"""
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )

    # Get questions for this interview
    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).order_by(Question.order_number).all()

    return {
        "id": interview.id,
        "resume_id": interview.resume_id,
        "job_description": interview.job_description,
        "jd_analysis": interview.jd_analysis,
        "status": interview.status,
        "overall_score": interview.overall_score,
        "created_at": interview.created_at,
        "completed_at": interview.completed_at,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "question_number": q.order_number + 1,
                "question_type": q.question_context.get("question_type", "general"),
                "difficulty": q.question_context.get("difficulty", "medium"),
                "category": q.question_context.get("category", "general"),
                "expected_topics": q.question_context.get("expected_topics", [])
            }
            for q in questions
        ]
    }


@router.delete("/{interview_id}")
async def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete an interview"""
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )

    db.delete(interview)
    db.commit()

    return {"message": "Interview deleted successfully"}
