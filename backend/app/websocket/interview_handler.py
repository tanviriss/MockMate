"""
WebSocket event handlers for real-time interview sessions
"""
import socketio
import tempfile
import os
import base64
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.logging_config import logger

from app.database import get_db, SessionLocal
from app.models.interview import Interview
from app.models.question import Question
from app.models.answer import Answer
from app.models.resume import Resume
from app.services.text_to_speech import text_to_speech_service, TTSError
from app.services.speech_to_text import speech_to_text_service, STTError
from app.services.storage_service import StorageService
from app.services.evaluation_service import evaluate_answer, calculate_overall_score
from app.services.followup_service import should_ask_followup
from app.websocket.session_manager import session_manager
from app.config import settings
from app.supabase_client import get_supabase

# Configure CORS based on environment - NEVER use wildcard in production
cors_origins = settings.ALLOWED_ORIGINS.split(',') if settings.ALLOWED_ORIGINS else []

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=cors_origins if cors_origins else '*',
    logger=settings.DEBUG,
    engineio_logger=settings.DEBUG
)


async def validate_token(token: str) -> Optional[dict]:
    """
    Validate JWT token with Supabase

    Returns:
        User data dict if valid, None otherwise
    """
    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)

        if user_response and user_response.user:
            return {
                'id': user_response.user.id,
                'email': user_response.user.email
            }
        return None
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        return None


@sio.event
async def connect(sid, environ, auth):
    """Handle client connection with authentication"""
    logger.info(f"Client attempting to connect: {sid}")

    # Validate authentication token
    if not auth or 'token' not in auth:
        logger.warning(f"Connection rejected for {sid}: No authentication token")
        return False

    token = auth['token']
    user_data = await validate_token(token)

    if not user_data:
        logger.warning(f"Connection rejected for {sid}: Invalid token")
        return False

    logger.info(f"Authenticated connection from {sid} (user: {user_data['email']})")
    await sio.emit('connected', {'sid': sid}, room=sid)
    return True


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {sid}")

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
    db: Session = next(get_db())
    try:
        interview_id = data.get('interview_id')
        user_id = data.get('user_id')

        if not interview_id or not user_id:
            await sio.emit('error', {
                'message': 'Missing interview_id or user_id'
            }, room=sid)
            return

        session = session_manager.create_session(sid, interview_id, user_id)

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

    except SQLAlchemyError as e:
        logger.error(f"Database error starting interview: {e}")
        db.rollback()
        await sio.emit('error', {
            'message': 'Database error starting interview. Please try again.'
        }, room=sid)
    except Exception as e:
        logger.error(f"Error starting interview: {e}")
        await sio.emit('error', {
            'message': f'Error starting interview: {str(e)}'
        }, room=sid)
    finally:
        db.close()


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
        logger.error(f"Error sending question: {e}")
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

        with tempfile.NamedTemporaryFile(
            delete=True,
            suffix=f'.{audio_format}'
        ) as temp_file:
            temp_file.write(audio_bytes)
            temp_file.flush()

            await sio.emit('transcribing', {
                'message': 'Transcribing your answer...'
            }, room=sid)

            transcription_result = await speech_to_text_service.transcribe_audio(
                audio_file_path=temp_file.name,
                language="en"
            )

            transcript = transcription_result['text']

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

    except Exception as e:
        logger.error(f"Error submitting answer: {e}")
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

        session = session_manager.get_session(sid)
        if not session:
            await sio.emit('error', {
                'message': 'Session not found'
            }, room=sid)
            return

        db: Session = next(get_db())

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

        import base64
        audio_bytes = base64.b64decode(answer_data['audio_bytes'])


        current_question = db.query(Question).filter(Question.id == question_id).first()

        if not current_question:
            await sio.emit('error', {
                'message': 'Question not found'
            }, room=sid)
            return

        is_answering_followup = (
            session.pending_followup and
            session.pending_followup.get('parent_question_id') == question_id
        )

        if is_answering_followup:
            existing_answer = db.query(Answer).filter(
                Answer.question_id == question_id
            ).first()

            if existing_answer:
                existing_answer.transcript += f"\n\n[Follow-up: {session.pending_followup.get('followup_data', {}).get('followup_question', 'Additional question')}]\n{transcript}"
                db.commit()
                logger.info(f"Appended follow-up answer to question {question_id}")
            else:
                answer = Answer(
                    question_id=question_id,
                    transcript=transcript,
                    score=None,
                    evaluation=None
                )
                db.add(answer)
                db.commit()
        else:
            answer = Answer(
                question_id=question_id,
                transcript=transcript,
                score=None,
                evaluation=None
            )
            db.add(answer)
            db.commit()

        if is_answering_followup:
            logger.info(f"User answered follow-up for question {question_id}, moving to next question")
            session.pending_followup = None
            session_manager.update_session(sid, session)
        else:
            needs_followup, followup_data = await should_ask_followup(
                question_text=current_question.question_text,
                answer_transcript=transcript,
                question_context=current_question.question_context or {}
            )

            if needs_followup and followup_data:
                followup_text = followup_data.get('followup_question', '')

                if not followup_text:
                    logger.warning("Follow-up generated but no question text found")
                else:
                    await sio.emit('followup_question', {
                        'question_id': question_id,
                        'followup_text': followup_text,
                        'reason': followup_data.get('reason', ''),
                        'is_followup': True
                    }, room=sid)

                    followup_audio_bytes = await text_to_speech_service.generate_speech(followup_text)

                    import base64
                    followup_audio_base64 = base64.b64encode(followup_audio_bytes).decode('utf-8')

                    await sio.emit('question_audio', {
                        'question_id': question_id,
                        'audio_data': followup_audio_base64,
                        'is_followup': True
                    }, room=sid)

                    session.pending_followup = {
                        'parent_question_id': question_id,
                        'followup_data': followup_data
                    }
                    session_manager.update_session(sid, session)
                    return

        session.current_question_index += 1
        session_manager.update_session(sid, session)

        question = db.query(Question).filter(
            Question.interview_id == session.interview_id,
            Question.order_number == session.current_question_index
        ).first()

        if question:
            total_questions = db.query(Question).filter(
                Question.interview_id == session.interview_id
            ).count()

            await send_question(sid, question, session.current_question_index, total_questions)
        else:
            await complete_interview(sid, session, db)

    except Exception as e:
        logger.error(f"Error confirming answer: {e}")
        await sio.emit('error', {
            'message': f'Error confirming answer: {str(e)}'
        }, room=sid)


async def evaluate_interview_async(interview_id: int, db: Session):
    """Evaluate all answers in an interview (background task)"""
    try:
        import time
        start_time = time.time()
        logger.info(f"[EVALUATION] Starting evaluation for interview {interview_id}")

        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            logger.info(f"[EVALUATION] Interview {interview_id} not found")
            return

        resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
        if not resume:
            logger.info(f"[EVALUATION] Resume not found for interview {interview_id}")
            return

        questions = db.query(Question).filter(
            Question.interview_id == interview_id
        ).order_by(Question.order_number).all()

        total_questions = len(questions)
        logger.info(f"[EVALUATION] Found {total_questions} questions to evaluate")

        evaluations = []

        for idx, question in enumerate(questions, 1):
            question_start = time.time()
            answer = db.query(Answer).filter(Answer.question_id == question.id).first()

            if not answer or not answer.transcript:
                logger.info(f"[EVALUATION] No answer found for question {question.id} ({idx}/{total_questions})")
                continue

            logger.info(f"[EVALUATION] Evaluating question {idx}/{total_questions} (ID: {question.id})...")

            evaluation = await evaluate_answer(
                question_text=question.question_text,
                question_context=question.question_context or {},
                answer_transcript=answer.transcript,
                resume_data=resume.parsed_data or {},
                jd_analysis=interview.jd_analysis or {}
            )

            answer.evaluation = evaluation
            answer.score = evaluation.get('score', 0)
            evaluations.append(evaluation)

            elapsed = time.time() - question_start
            logger.info(f"[EVALUATION] Question {idx}/{total_questions} evaluated in {elapsed:.2f}s - Score: {answer.score}")

        logger.info(f"[EVALUATION] Calculating overall score...")
        overall_score = await calculate_overall_score(evaluations)
        interview.overall_score = overall_score

        db.commit()

        total_elapsed = time.time() - start_time
        logger.info(f"[EVALUATION] ✓ Evaluation completed for interview {interview_id}")
        logger.info(f"[EVALUATION] Overall Score: {overall_score}/10")
        logger.info(f"[EVALUATION] Total time: {total_elapsed:.2f}s ({len(evaluations)} questions)")

    except Exception as e:
        logger.info(f"[EVALUATION] ✗ Error evaluating interview {interview_id}: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()


async def complete_interview(sid, session, db: Session):
    """Complete the interview"""
    try:
        interview = db.query(Interview).filter(
            Interview.id == session.interview_id
        ).first()

        if interview:
            interview.status = "completed"
            db.commit()

        session_manager.complete_session(sid)

        await sio.emit('interview_completed', {
            'interview_id': session.interview_id,
            'message': 'Interview completed! Evaluating your responses...'
        }, room=sid)

        import asyncio
        from app.database import SessionLocal

        async def run_evaluation():
            """Run evaluation with its own database session"""
            eval_db = SessionLocal()
            try:
                await evaluate_interview_async(session.interview_id, eval_db)
            finally:
                eval_db.close()

        asyncio.create_task(run_evaluation())

    except Exception as e:
        logger.error(f"Error completing interview: {e}")
        await sio.emit('error', {
            'message': f'Error completing interview: {str(e)}'
        }, room=sid)


@sio.event
async def end_interview(sid, data=None):
    """End interview early"""
    try:
        session = session_manager.get_session(sid)
        if session:
            db: Session = next(get_db())
            await complete_interview(sid, session, db)
    except Exception as e:
        logger.error(f"Error ending interview: {e}")
