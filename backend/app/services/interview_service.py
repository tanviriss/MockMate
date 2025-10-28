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

    # Extract detailed info from resume
    skills = resume_data.get('technical_skills', {})
    all_skills = []
    if skills:
        all_skills.extend(skills.get('languages', []))
        all_skills.extend(skills.get('frameworks_libraries', []))
        all_skills.extend(skills.get('cloud_databases', []))

    experiences = resume_data.get('experience', [])
    projects = resume_data.get('projects', [])

    # Build detailed context
    experience_context = ""
    if experiences:
        for exp in experiences[:3]:  # Top 3 experiences
            experience_context += f"\n- {exp.get('title', '')} at {exp.get('company', '')}: {', '.join(exp.get('responsibilities', [])[:2])}"

    project_context = ""
    if projects:
        for proj in projects[:2]:  # Top 2 projects
            project_context += f"\n- {proj.get('name', '')}: {', '.join(proj.get('description', [])[:1])}"

    prompt = f"""You are a senior technical interviewer. Generate {num_questions} REALISTIC interview questions that sound natural and conversational.

CANDIDATE BACKGROUND:
- Skills: {', '.join(all_skills[:15])}
- Recent Experience:{experience_context}
- Key Projects:{project_context}

JOB: {jd_analysis.get('job_title', 'Software Engineer')} | Level: {jd_analysis.get('experience_level', 'mid')} | Skills: {', '.join(jd_analysis.get('required_skills', [])[:8])}

CRITICAL: Questions MUST be SHORT, DIRECT, and NATURAL. DO NOT create long hypothetical scenarios!

✅ GOOD QUESTIONS (keep them this simple):
- "I see you used FastAPI at OpenGym. How did you handle authentication?"
- "Tell me about a bug you spent days debugging. What was it?"
- "Walk me through how you'd design a URL shortener."
- "What's the most complex database query you've written?"
- "I noticed your NYC subway project. What was the hardest part?"
- "Have you worked with caching? Tell me about a time you used it."
- "How do you approach code reviews?"
- "Explain async/await like I'm a junior developer."

❌ BAD QUESTIONS (too long, too hypothetical):
- "Let's say you're building a new feature that leverages a different LLM but its API has significantly higher latency. How would you architect your React/Next.js frontend..."
- "Imagine you're working on a distributed system with microservices and you need to implement..."
- Any question with "Let's say" or "Imagine" followed by 3+ sentences

QUESTION TYPES ({num_questions} total) - MIX THEM THROUGHOUT, DON'T GROUP BY TYPE:
1. TECHNICAL (35%) - Short, specific technical questions
   - "How does [technology] work?"
   - "I see you used [X]. Walk me through your implementation."
   - "What's the difference between [A] and [B]?"
   - "Explain [concept] in simple terms."

2. BEHAVIORAL (40%) - Simple past experience questions (MOST IMPORTANT)
   - "Tell me about a time you [did something]."
   - "What was your biggest challenge at [company]?"
   - "Describe a conflict you had with a teammate."
   - "Tell me about a project you're proud of and why."
   - "Have you ever missed a deadline? What happened?"
   - "Describe a time you had to learn something quickly."

3. PROJECT DEEP-DIVE (15%) - Ask about their actual projects
   - "I saw your [project name]. What was the hardest part?"
   - "Why did you choose [technology] for [project]?"
   - "Walk me through the architecture of [project]."

4. SYSTEM DESIGN (10%) - Classic design questions, keep them SHORT
   - "Design a URL shortener."
   - "How would you build a rate limiter?"
   - "Design a simple caching system."

DIFFICULTY MIX:
- First 3 questions: Easy-Medium (warm up)
- Middle questions: Medium-Hard (core skills)
- Last 2-3 questions: Hard (stretch)

RULES:
- Each question should be 1-2 sentences MAX
- Reference their actual resume/projects when possible
- Sound conversational, not robotic
- NO long hypothetical scenarios
- NO compound questions (asking 3 things in one question)
- Focus on ONE thing per question

Return JSON array:
[
    {{
        "question_number": 1,
        "question_text": "Short, natural question here",
        "question_type": "technical|behavioral|project_deepdive|system_design",
        "difficulty": "easy|medium|hard",
        "category": "Specific skill (e.g., 'FastAPI', 'Team Collaboration', 'React')",
        "expected_topics": ["topic1", "topic2", "topic3"],
        "skill_tags": ["skill1", "skill2"]
    }}
]

Return ONLY valid JSON, no markdown, no explanations."""

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

async def generate_ideal_answer(
    question_text: str,
    question_context: dict,
    resume_data: dict,
    jd_analysis: dict,
    user_answer: str = None
) -> dict:
    """
    Generate an ideal answer example for a given question
    Uses the user's answer context to make it more relevant
    """
    skills = resume_data.get('technical_skills', {})
    all_skills = []
    if skills:
        all_skills.extend(skills.get('languages', []))
        all_skills.extend(skills.get('frameworks_libraries', []))
        all_skills.extend(skills.get('cloud_databases', []))

    question_type = question_context.get('question_type', 'technical')

    # Build context from user's answer if provided
    user_context = ""
    if user_answer:
        user_context = f"""
**User's Answer (for context):**
{user_answer}

IMPORTANT: Use the SAME scenario/project/experience mentioned in the user's answer, but show how to answer it more effectively.
If they mentioned "NYC subway analysis project", use that same project.
If they mentioned "worked at Company X", reference that same company.
Keep their story but improve the structure, detail, and delivery.
"""

    prompt = f"""Generate an IDEAL ANSWER EXAMPLE for this interview question.

Question: {question_text}
Type: {question_type}
Job: {jd_analysis.get('job_title', 'Software Engineer')}
Skills: {', '.join(all_skills[:10])}

{user_context}

Generate a strong 150-200 word answer that:
- Uses the SAME context/scenario as the user if they provided one
- Shows proper STAR structure (for behavioral/situational questions)
- Adds specific technical details and reasoning
- Includes the "why" behind decisions
- Demonstrates learning and outcomes

For situational/behavioral questions:
- Situation: Set clear context (use their scenario!)
- Task: Define the specific challenge
- Action: Explain concrete steps with technical details
- Result: Quantify outcomes and learnings

Return JSON:
{{
    "ideal_answer": "Full improved answer using THEIR scenario",
    "key_points": ["point 1", "point 2", "point 3"],
    "structure": {{"opening": "how to start", "body": "main content", "closing": "how to end"}},
    "why_this_works": "why this answer is stronger"
}}

Return ONLY JSON, no markdown."""

    response = model.generate_content(prompt)
    import json
    result_text = response.text.strip()
    
    if result_text.startswith('```json'):
        result_text = result_text[7:]
    if result_text.startswith('```'):
        result_text = result_text[3:]
    if result_text.endswith('```'):
        result_text = result_text[:-3]
    
    return json.loads(result_text.strip())
