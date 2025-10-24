"""
WebSocket event handlers for real-time interview sessions
"""
import socketio
import tempfile
import os
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.interview import Interview
from app.models.question import Question
from app.models.answer import Answer
from app.models.resume import Resume
from app.services.text_to_speech import text_to_speech_service
from app.services.speech_to_text import speech_to_text_service
from app.services.storage_service import StorageService
from app.services.evaluation_service import evaluate_answer, calculate_overall_score
from app.websocket.session_manager import session_manager


sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)


@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    print(f"Client connected: {sid}")

    if auth and 'token' in auth:
        token = auth['token']
        print(f"Authenticated connection from {sid}")

    await sio.emit('connected', {'sid': sid}, room=sid)


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"Client disconnected: {sid}")

    session = session_manager.get_session(sid)
    if session:
        session_manager.delete_session(sid)


@sio.event
async def start_interview(sid, data):
    """
    Start an interview session

    Expected data:
    {
        "interview_id": int,
        "user_id": str
    }
    """
    try:
        interview_id = data.get('interview_id')
        user_id = data.get('user_id')

        if not interview_id or not user_id:
            await sio.emit('error', {
                'message': 'Missing interview_id or user_id'
            }, room=sid)
            return

        session = session_manager.create_session(sid, interview_id, user_id)

        db: Session = next(get_db())
        interview = db.query(Interview).filter(Interview.id == interview_id).first()

        if not interview:
            await sio.emit('error', {
                'message': 'Interview not found'
            }, room=sid)
            return

        questions = db.query(Question).filter(
            Question.interview_id == interview_id
        ).order_by(Question.order_number).all()

        if not questions:
            await sio.emit('error', {
                'message': 'No questions found for this interview'
            }, room=sid)
            return

        first_question = questions[0]

        interview.status = "in_progress"
        db.commit()

        await sio.emit('interview_started', {
            'interview_id': interview_id,
            'total_questions': len(questions),
            'current_question_index': 0
        }, room=sid)

        await send_question(sid, first_question, 0, len(questions))

    except Exception as e:
        print(f"Error starting interview: {e}")
        await sio.emit('error', {
            'message': f'Error starting interview: {str(e)}'
        }, room=sid)


async def send_question(sid, question: Question, question_index: int, total_questions: int):
    """Send question to client with audio"""
    try:
        await sio.emit('question', {
            'question_id': question.id,
            'question_text': question.question_text,
            'question_number': question_index + 1,
            'total_questions': total_questions,
            'context': question.question_context
        }, room=sid)

        audio_bytes = await text_to_speech_service.generate_speech(
            text=question.question_text,
            voice="professional_female"
        )

        import base64
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')

        await sio.emit('question_audio', {
            'audio_data': audio_b64,
            'format': 'mp3'
        }, room=sid)

    except Exception as e:
        print(f"Error sending question: {e}")
        await sio.emit('error', {
            'message': f'Error sending question: {str(e)}'
        }, room=sid)


@sio.event
async def submit_answer(sid, data):
    """
    Handle answer submission

    Expected data:
    {
        "question_id": int,
        "audio_data": str (base64 encoded),
        "format": str (e.g., "webm", "wav")
    }
    """
    try:
        question_id = data.get('question_id')
        audio_data_b64 = data.get('audio_data')
        audio_format = data.get('format', 'webm')

        if not question_id or not audio_data_b64:
            await sio.emit('error', {
                'message': 'Missing question_id or audio_data'
            }, room=sid)
            return

        import base64
        audio_bytes = base64.b64decode(audio_data_b64)

        # Validate audio size
        if len(audio_bytes) < 100:
            await sio.emit('error', {
                'message': 'Audio file too small. Please record again.'
            }, room=sid)
            return

        session = session_manager.get_session(sid)
        if not session:
            await sio.emit('error', {
                'message': 'Session not found'
            }, room=sid)
            return

        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f'.{audio_format}'
        ) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        try:
            # Transcribe audio
            await sio.emit('transcribing', {
                'message': 'Transcribing your answer...'
            }, room=sid)

            transcription_result = await speech_to_text_service.transcribe_audio(
                audio_file_path=temp_path,
                language="en"
            )

            transcript = transcription_result['text']

            # Send transcript for confirmation
            await sio.emit('transcript_ready', {
                'question_id': question_id,
                'transcript': transcript,
                'duration': transcription_result.get('duration')
            }, room=sid)

            session_manager.add_answer(sid, question_id, {
                'transcript': transcript,
                'audio_bytes': audio_data_b64,
                'format': audio_format
            })

        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    except Exception as e:
        print(f"Error submitting answer: {e}")
        await sio.emit('error', {
            'message': f'Error processing answer: {str(e)}'
        }, room=sid)


@sio.event
async def confirm_answer(sid, data):
    """
    Confirm answer and move to next question

    Expected data:
    {
        "question_id": int,
        "transcript": str (can be edited by user)
    }
    """
    try:
        question_id = data.get('question_id')
        transcript = data.get('transcript')

        # Get session
        session = session_manager.get_session(sid)
        if not session:
            await sio.emit('error', {
                'message': 'Session not found'
            }, room=sid)
            return

        # Get database session
        db: Session = next(get_db())

        # Get the answer from session
        answer_data = None
        for ans in session.answers:
            if ans['question_id'] == question_id:
                answer_data = ans
                break

        if not answer_data:
            await sio.emit('error', {
                'message': 'Answer not found in session'
            }, room=sid)
            return

        # Upload audio to storage
        import base64
        audio_bytes = base64.b64decode(answer_data['audio_bytes'])

        # Note: We'll upload this later when we save to database
        # For now, just save the transcript

        answer = Answer(
            question_id=question_id,
            transcript=transcript,
            audio_url=None,  # Will be set later
            score=None,  # Will be set after evaluation
            evaluation=None  # Will be set after evaluation
        )
        db.add(answer)
        db.commit()

        # Move to next question
        session.current_question_index += 1
        session_manager.update_session(sid, session)

        # Get next question
        question = db.query(Question).filter(
            Question.interview_id == session.interview_id,
            Question.order_number == session.current_question_index
        ).first()

        if question:
            # Send next question
            total_questions = db.query(Question).filter(
                Question.interview_id == session.interview_id
            ).count()

            await send_question(sid, question, session.current_question_index, total_questions)
        else:
            # No more questions, interview complete
            await complete_interview(sid, session, db)

    except Exception as e:
        print(f"Error confirming answer: {e}")
        await sio.emit('error', {
            'message': f'Error confirming answer: {str(e)}'
        }, room=sid)


async def evaluate_interview_async(interview_id: int, db: Session):
    """Evaluate all answers in an interview (background task)"""
    try:
        print(f"Starting evaluation for interview {interview_id}")

        # Get interview
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            return

        # Get resume
        resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
        if not resume:
            return

        # Get all questions with answers
        questions = db.query(Question).filter(
            Question.interview_id == interview_id
        ).order_by(Question.order_number).all()

        evaluations = []

        for question in questions:
            answer = db.query(Answer).filter(Answer.question_id == question.id).first()

            if not answer or not answer.transcript:
                continue

            # Evaluate answer
            evaluation = await evaluate_answer(
                question_text=question.question_text,
                question_context=question.question_context or {},
                answer_transcript=answer.transcript,
                resume_data=resume.parsed_data or {},
                jd_analysis=interview.jd_analysis or {}
            )

            # Save evaluation
            answer.evaluation = evaluation
            answer.score = evaluation.get('score', 0)
            evaluations.append(evaluation)

        # Calculate overall score
        overall_score = await calculate_overall_score(evaluations)
        interview.overall_score = overall_score

        db.commit()
        print(f"Evaluation completed for interview {interview_id}. Score: {overall_score}")

    except Exception as e:
        print(f"Error evaluating interview: {e}")
        db.rollback()


async def complete_interview(sid, session, db: Session):
    """Complete the interview"""
    try:
        # Update interview status
        interview = db.query(Interview).filter(
            Interview.id == session.interview_id
        ).first()

        if interview:
            interview.status = "completed"
            db.commit()

        # Mark session as completed
        session_manager.complete_session(sid)

        # Send completion event
        await sio.emit('interview_completed', {
            'interview_id': session.interview_id,
            'message': 'Interview completed! Evaluating your responses...'
        }, room=sid)

        # Trigger evaluation in background
        import asyncio
        asyncio.create_task(evaluate_interview_async(session.interview_id, db))

    except Exception as e:
        print(f"Error completing interview: {e}")
        await sio.emit('error', {
            'message': f'Error completing interview: {str(e)}'
        }, room=sid)


@sio.event
async def end_interview(sid, data):
    """End interview early"""
    try:
        session = session_manager.get_session(sid)
        if session:
            db: Session = next(get_db())
            await complete_interview(sid, session, db)
    except Exception as e:
        print(f"Error ending interview: {e}")
