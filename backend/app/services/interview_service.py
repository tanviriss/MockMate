"""
Interview generation service using Gemini AI
"""
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')


async def analyze_job_description(jd_text: str) -> dict:
    """
    Analyze job description to extract key requirements

    Args:
        jd_text: Job description text

    Returns:
        Dictionary with analyzed JD data
    """
    prompt = f"""
    Analyze this job description and extract key information in JSON format.

    Job Description:
    {jd_text}

    Return a JSON object with:
    {{
        "job_title": "extracted job title",
        "company": "company name if mentioned",
        "required_skills": ["skill1", "skill2", ...],
        "preferred_skills": ["skill1", "skill2", ...],
        "experience_level": "entry/mid/senior",
        "key_responsibilities": ["responsibility1", "responsibility2", ...],
        "technical_requirements": ["requirement1", "requirement2", ...],
        "soft_skills": ["skill1", "skill2", ...]
    }}

    Extract as much detail as possible. If information is not available, use null.
    Return ONLY the JSON object, no additional text.
    """

    response = model.generate_content(prompt)

    # Parse JSON from response
    import json
    result_text = response.text.strip()

    # Remove markdown code blocks if present
    if result_text.startswith('```json'):
        result_text = result_text[7:]
    if result_text.startswith('```'):
        result_text = result_text[3:]
    if result_text.endswith('```'):
        result_text = result_text[:-3]

    return json.loads(result_text.strip())


async def generate_interview_questions(resume_data: dict, jd_analysis: dict, num_questions: int = 10) -> list:
    """
    Generate interview questions based on resume and job description

    Args:
        resume_data: Parsed resume data
        jd_analysis: Analyzed job description
        num_questions: Number of questions to generate

    Returns:
        List of question dictionaries
    """
    prompt = f"""
    You are an expert interviewer. Generate {num_questions} interview questions for a candidate based on their resume and the job requirements.

    CANDIDATE RESUME:
    - Name: {resume_data.get('name', 'N/A')}
    - Skills: {', '.join(resume_data.get('technical_skills', {}).get('languages', [])[:10])}
    - Experience: {len(resume_data.get('experience', []))} positions
    - Education: {resume_data.get('education', [{}])[0].get('degree', 'N/A') if resume_data.get('education') else 'N/A'}

    JOB REQUIREMENTS:
    - Title: {jd_analysis.get('job_title', 'N/A')}
    - Required Skills: {', '.join(jd_analysis.get('required_skills', [])[:10])}
    - Experience Level: {jd_analysis.get('experience_level', 'N/A')}
    - Key Responsibilities: {', '.join(jd_analysis.get('key_responsibilities', [])[:5])}

    Generate questions that:
    1. Test technical skills relevant to BOTH the resume and job requirements
    2. Assess experience with responsibilities mentioned in the job description
    3. Include a mix of technical, behavioral, and situational questions
    4. Are progressively challenging
    5. Are specific to the candidate's background and the role

    Return a JSON array with this exact structure:
    [
        {{
            "question_number": 1,
            "question_text": "the question text",
            "question_type": "technical|behavioral|situational",
            "difficulty": "easy|medium|hard",
            "category": "category like 'Python', 'System Design', 'Leadership', etc.",
            "expected_topics": ["topic1", "topic2"]
        }},
        ...
    ]

    Return ONLY the JSON array, no additional text or explanations.
    """

    response = model.generate_content(prompt)

    # Parse JSON from response
    import json
    result_text = response.text.strip()

    # Remove markdown code blocks if present
    if result_text.startswith('```json'):
        result_text = result_text[7:]
    if result_text.startswith('```'):
        result_text = result_text[3:]
    if result_text.endswith('```'):
        result_text = result_text[:-3]

    return json.loads(result_text.strip())
