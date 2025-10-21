from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app.models.resume import Resume
from app.services.pdf_parser import extract_text_from_pdf
from app.services.gemini_service import parse_resume_text

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )

    # Read file content
    try:
        content = await file.read()
        max_size = 10 * 1024 * 1024
        if len(content) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit"
            )

        # Extract text from PDF
        from io import BytesIO
        pdf_file = BytesIO(content)
        resume_text = extract_text_from_pdf(pdf_file)

        parsed_data = await parse_resume_text(resume_text)

        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_url = f"/uploads/{unique_filename}"  # Placeholder URL

        resume = Resume(
            user_id=current_user.id,
            file_url=file_url,
            parsed_data=parsed_data
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        return {
            "id": resume.id,
            "file_url": resume.file_url,
            "parsed_data": resume.parsed_data,
            "created_at": resume.created_at,
            "message": "Resume uploaded and parsed successfully!"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}"
        )


@router.get("/")
async def list_resumes(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all resumes for the current user"""
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()

    return {
        "count": len(resumes),
        "resumes": [
            {
                "id": r.id,
                "file_url": r.file_url,
                "parsed_data": r.parsed_data,
                "created_at": r.created_at
            }
            for r in resumes
        ]
    }


@router.get("/{resume_id}")
async def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    return {
        "id": resume.id,
        "file_url": resume.file_url,
        "parsed_data": resume.parsed_data,
        "created_at": resume.created_at
    }


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    db.delete(resume)
    db.commit()

    return {"message": "Resume deleted successfully"}
