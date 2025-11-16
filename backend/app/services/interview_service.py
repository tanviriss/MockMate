"""
Interview generation service using Gemini AI
"""
import google.generativeai as genai
from app.config import settings
import json

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')


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

    prompt = f"""You are generating realistic interview questions for a {jd_analysis.get('job_title', 'Software Engineer')} position.

**Job Requirements:** {', '.join(jd_analysis.get('required_skills', [])[:8])}
**Key Responsibilities:** {', '.join(jd_analysis.get('key_responsibilities', [])[:3])}
**Company/Role:** {jd_analysis.get('company', 'Not specified')}

**Candidate Skills:** {', '.join(all_skills[:10])}
**Candidate Experience:**{experience_context}
**Candidate Projects:**{project_context}
**Experience Level:** {jd_analysis.get('experience_level', 'mid')}

Generate {num_questions} interview questions that match REAL interview patterns AND are RELEVANT to both the job requirements and the candidate's background.

**CRITICAL RULES:**
1. Questions must be DIRECT and CONCISE (no conversational fluff)
2. NO personalized references like "You mentioned..." or "Your project..."
3. NO compliments or narrative style ("sounds fascinating!")
4. Ask questions a HUMAN interviewer would actually ask
5. Use industry-standard phrasing

**Question Type Distribution:**
- 50% Technical Definition/Concept Questions (direct, knowledge-based)
- 30% Behavioral Questions (STAR method, past experiences)
- 20% Experience/Project Questions (open-ended but brief)

**TECHNICAL QUESTIONS - Examples of GOOD patterns:**
✓ "What's the difference between LEFT JOIN and RIGHT JOIN in SQL?"
✓ "Explain how closures work in JavaScript"
✓ "What is normalization in databases?"
✓ "How does the event loop work in Node.js?"
✓ "What are the main differences between REST and GraphQL?"
✓ "Explain the virtual DOM in React"
✓ "What is dependency injection?"
✓ "How would you optimize a slow-running SQL query?"

**BEHAVIORAL QUESTIONS - Examples of GOOD patterns:**
✓ "Tell me about a time you had a conflict with a coworker"
✓ "Describe a situation where you had to meet a tight deadline"
✓ "Tell me about the most difficult bug you've fixed recently"
✓ "How do you handle receiving criticism on your work?"
✓ "Describe a time you had to learn a new technology quickly"

**EXPERIENCE QUESTIONS - Examples of GOOD patterns:**
✓ "Walk me through a project you're most proud of"
✓ "What's the most challenging technical problem you've solved?"
✓ "Tell me about your experience with [specific technology from resume]"
✓ "What challenges have you faced working in a team?"

**AVOID these patterns:**
✗ "You mentioned working with SQL. Can you describe a time..."
✗ "Your OpenGym project sounds fascinating! Can you walk me through..."
✗ "I see you have experience with Python..."
✗ "That's interesting! Tell me more about..."

**Question Selection Strategy:**
- **RELEVANCE IS KEY**: Questions MUST connect the candidate's actual experience to the job requirements
- For technical questions: Ask about technologies/concepts that appear in BOTH the JD and the candidate's background
  - Example: If candidate has AWS experience and JD mentions cloud → ask about specific AWS services
  - Example: If candidate built AI tools and JD needs ML → ask about their AI/ML approach
- For experience questions: Reference their actual project domains (healthcare AI, wildfire detection, etc.) in relation to the job
  - Example: If they built medical AI and JD is healthcare → ask how they'd apply that experience
- For behavioral: Tailor to the role's key responsibilities (if JD emphasizes teamwork, ask about collaboration)
- Difficulty should match: entry=easy/medium, mid=medium, senior=medium/hard
- **AVOID generic textbook questions** - every question should feel relevant to THIS specific interview

Return JSON array with {num_questions} questions:
[
    {{
        "question_number": 1,
        "question_text": "Direct question here - no fluff",
        "question_type": "technical_concept|technical_coding|behavioral|experience|system_design",
        "difficulty": "easy|medium|hard",
        "category": "specific skill or topic",
        "expected_topics": ["topic1", "topic2"],
        "skill_tags": ["relevant_skill"]
    }}
]

Return ONLY valid JSON, no markdown."""

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


async def generate_resume_grill_questions(resume_data: dict, num_questions: int = 10) -> list:
    """
    Generate CRITICAL questions that grill the candidate on their resume
    No job description - purely testing if they know what they wrote

    Args:
        resume_data: Parsed resume data
        num_questions: Number of questions to generate (default 10)

    Returns:
        List of tough, probing questions about their resume
    """

    # Extract all resume details
    skills = resume_data.get('technical_skills', {})
    all_skills = []
    if skills:
        all_skills.extend(skills.get('languages', []))
        all_skills.extend(skills.get('frameworks_libraries', []))
        all_skills.extend(skills.get('cloud_databases', []))
        all_skills.extend(skills.get('ai_tools', []))
        all_skills.extend(skills.get('developer_tools', []))

    experiences = resume_data.get('experience', [])
    projects = resume_data.get('projects', [])

    # Build detailed context for grilling
    experience_details = ""
    if experiences:
        for exp in experiences:
            experience_details += f"\n- {exp.get('title', '')} at {exp.get('company', '')}"
            for resp in exp.get('responsibilities', []):
                experience_details += f"\n  • {resp}"

    project_details = ""
    if projects:
        for proj in projects:
            project_details += f"\n- {proj.get('name', '')} ({', '.join(proj.get('technologies', [])[:5])})"
            for desc in proj.get('description', []):
                project_details += f"\n  • {desc}"

    prompt = f"""You are conducting a RESUME GRILL interview. Your job is to test if the candidate ACTUALLY knows what they put on their resume.

**Candidate's Resume:**

**Technical Skills:** {', '.join(all_skills)}

**Experience:**{experience_details}

**Projects:**{project_details}

Generate {num_questions} SHORT, PUNCHY questions that test their deep knowledge of what they wrote.

**CRITICAL RULES:**
1. Keep questions SHORT (under 20 words) - no long explanations or context
2. Be DIRECT and SKEPTICAL - assume they might be exaggerating
3. Questions should be ONE specific thing - don't ask 3 things in one question
4. Make them PROVE they did the work with specifics
5. Test understanding of technologies they claim to know
6. Challenge metrics they claim (e.g., "80% reduction" - HOW did you measure it?)

**Question Types to Mix:**

**A) Metric Challenges (30%)** - Make them prove their numbers:
- "How did you measure that 95% accuracy?"
- "What does '80% reduction' actually mean? Show the math."
- "How did you benchmark that performance improvement?"
- "What's your definition of 'success' for that metric?"

**B) Technology Depth (30%)** - Test if they know the tools:
- "Why Redis over Memcached?"
- "Explain how Celery task routing works."
- "What's the latency of Groq Whisper in your app?"
- "Why use PostgreSQL AND DynamoDB?"

**C) Implementation Specifics (25%)** - Make them explain HOW:
- "Walk through your 3-step fallback system."
- "How did you handle race conditions in Redis?"
- "Explain your error handling for failed API calls."
- "What's your retry logic for Celery tasks?"

**D) Decision Justification (15%)** - Challenge their choices:
- "Why Gemini over GPT-4?"
- "Why not use AWS SQS instead of Celery?"
- "What made you pick ElevenLabs for TTS?"
- "Why WebSocket instead of polling?"

**IMPORTANT:**
- Questions MUST be under 20 words - be ruthlessly concise
- Every question ties to SPECIFIC details from their resume
- One question = one thing to prove
- No multi-part questions
- Short, sharp, and skeptical

Return JSON array with {num_questions} questions:
[
    {{
        "question_number": 1,
        "question_text": "Specific probing question about their resume",
        "question_type": "technology_deepdive|implementation_detail|critical_thinking",
        "difficulty": "medium|hard",
        "category": "Technology or Project name from resume",
        "expected_topics": ["topic1", "topic2"],
        "skill_tags": ["specific_technology"],
        "resume_reference": "What part of resume this tests"
    }}
]

Return ONLY valid JSON, no markdown."""

    response = model.generate_content(prompt)

    # Parse JSON from response
    result_text = response.text.strip()

    if result_text.startswith('```json'):
        result_text = result_text[7:]
    if result_text.startswith('```'):
        result_text = result_text[3:]
    if result_text.endswith('```'):
        result_text = result_text[:-3]

    return json.loads(result_text.strip())
