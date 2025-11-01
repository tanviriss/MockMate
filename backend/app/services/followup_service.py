"""
Adaptive follow-up question generation service
Analyzes answers in real-time and generates clarifying questions
"""
import google.generativeai as genai
from app.config import settings
import json
from app.logging_config import logger

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')


async def analyze_answer_quality(
    question_text: str,
    answer_transcript: str,
    question_context: dict
) -> dict:
    """
    Quick analysis to determine if a follow-up question is needed

    Returns:
        Dict with needs_followup (bool) and reason (str)
    """

    # Quick checks first
    word_count = len(answer_transcript.split())

    # If answer is very short, definitely needs follow-up
    if word_count < 20:
        return {
            "needs_followup": True,
            "reason": "answer_too_short",
            "word_count": word_count
        }

    # Use AI for deeper analysis
    prompt = f"""Analyze this interview answer QUICKLY and determine if it needs a follow-up question.

Question: {question_text}
Question Type: {question_context.get('question_type', 'general')}

Answer: {answer_transcript}

Does this answer need a follow-up question? Consider:
1. Is it too vague or generic?
2. Missing specific examples or details?
3. Didn't use STAR method (for behavioral)?
4. Avoided the actual question?
5. Too short (< 50 words)?

Return JSON:
{{
    "needs_followup": true/false,
    "reason": "brief explanation why",
    "missing_elements": ["what's missing from the answer"]
}}

Return ONLY JSON, no markdown."""

    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()

        # Clean markdown
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]

        analysis = json.loads(result_text.strip())
        analysis['word_count'] = word_count
        return analysis

    except Exception as e:
        logger.error(f"Error analyzing answer quality: {e}")
        # Default to no follow-up if analysis fails
        return {
            "needs_followup": False,
            "reason": "analysis_failed",
            "word_count": word_count
        }


async def generate_followup_question(
    original_question: str,
    answer_transcript: str,
    question_context: dict,
    missing_elements: list = None
) -> dict:
    """
    Generate a natural follow-up question to dig deeper

    Returns:
        Dict with followup_question (str) and focus (str)
    """

    question_type = question_context.get('question_type', 'general')
    missing = ', '.join(missing_elements) if missing_elements else 'specifics and details'

    prompt = f"""You are conducting a live interview. The candidate just gave an incomplete answer. Generate a natural, conversational follow-up question.

Original Question: {original_question}
Type: {question_type}

Their Answer: {answer_transcript}

Missing: {missing}

Generate ONE follow-up question that:
1. Sounds natural and conversational (like a real interviewer)
2. Encourages them to add more detail
3. Is specific about what you want to hear
4. For behavioral: Probe for STAR elements they missed
5. For technical: Ask for examples or deeper explanation

Examples of GOOD follow-ups:
- "Can you walk me through the specific steps you took to solve that problem?"
- "What metrics did you use to measure the success of that project?"
- "Tell me more about how you handled the technical challenges you mentioned."
- "What was the actual outcome or result of that situation?"

Return JSON:
{{
    "followup_question": "The natural follow-up question",
    "focus": "brief note on what we're probing for"
}}

Return ONLY JSON, no markdown."""

    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()

        # Clean markdown
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]

        followup = json.loads(result_text.strip())
        return followup

    except Exception as e:
        logger.error(f"Error generating follow-up: {e}")
        # Return a generic follow-up
        return {
            "followup_question": "Could you elaborate on that with a specific example?",
            "focus": "getting more detail"
        }


async def should_ask_followup(
    question_text: str,
    answer_transcript: str,
    question_context: dict
) -> tuple[bool, dict]:
    """
    Determine if we should ask a follow-up and generate it if needed

    Returns:
        Tuple of (should_ask: bool, followup_data: dict)
    """

    # Analyze answer quality
    analysis = await analyze_answer_quality(
        question_text,
        answer_transcript,
        question_context
    )

    if not analysis.get('needs_followup', False):
        return False, {}

    # Generate follow-up question
    followup = await generate_followup_question(
        question_text,
        answer_transcript,
        question_context,
        analysis.get('missing_elements', [])
    )

    return True, {
        "followup_question": followup.get('followup_question'),
        "focus": followup.get('focus'),
        "reason": analysis.get('reason'),
        "original_answer_length": analysis.get('word_count', 0)
    }
