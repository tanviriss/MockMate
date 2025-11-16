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
1. Keep questions SHORT (under 15 words) - be ruthlessly concise
2. Remove ALL filler words - get straight to the point
3. Be DIRECT and SKEPTICAL - assume they might be exaggerating
4. ONE question = ONE specific thing to prove
5. Use simple, conversational language - avoid formal/academic tone
6. Questions should sound like a skeptical interviewer challenging claims

**Question Types to Mix:**

**A) Metric Challenges (30%)** - Make them prove numbers:
Good examples:
✓ "How did you measure the 80% reduction?"
✓ "What's your definition of '95% accuracy'?"
✓ "How did you benchmark that improvement?"

Bad examples (too long/formal):
✗ "Can you walk me through how you measured and validated the 95% accuracy metric?"
✗ "What constitutes a successful data fetch in your accuracy calculation?"

**B) Technology Choices (30%)** - Challenge their stack:
Good examples:
✓ "Why Celery + Redis over AWS SQS?"
✓ "Why use both PostgreSQL AND DynamoDB?"
✓ "What's Groq Whisper's latency in your app?"

Bad examples:
✗ "What specific advantages did Celery offer over simpler asynchronous task queues?"
✗ "Can you elaborate on why you selected Redis as the message broker?"

**C) Implementation Details (25%)** - Make them explain HOW:
Good examples:
✓ "Explain your 3-step fallback system."
✓ "What Selenium selectors did you use?"
✓ "How does Next.js handle WebSocket connections?"

Bad examples:
✗ "Walk me through the technical implementation of your fallback mechanism."
✗ "Can you describe the dataflow and processing pipeline in detail?"

**D) Tech Understanding (15%)** - Test if they know their tools:
Good examples:
✓ "How does Celery task routing work?"
✓ "Explain Redis pub/sub."
✓ "What's the difference between RDB and AOF in Redis?"

Bad examples:
✗ "What specific Redis data structures did you leverage for managing tasks?"
✗ "Elaborate on the architectural considerations you made when implementing..."

**FINAL CHECKLIST - Every question MUST:**
- Be under 15 words (ruthlessly cut filler)
- Reference SPECIFIC project/tech from their resume
- Ask ONE thing only (no "and" or multiple parts)
- Use simple language (avoid: "elaborate", "articulate", "walk me through")
- Sound like a skeptical interviewer, not a chatbot

**GOOD question structure:**
- "Why [tech A] over [tech B]?"
- "How did you measure [metric]?"
- "What [specific implementation detail]?"
- "Explain [technology concept]."

**BAD question patterns to AVOID:**
- DON'T prefix with project/company names ("OpenGym:", "ClinicSense:", "Cognizant:")
- DON'T start with "Can you..." or "Could you..."
- DON'T use formal language ("elaborate", "describe in detail", "walk me through")
- DON'T ask multiple things in one question
- DON'T add context/setup - get straight to the question

Return JSON array with {num_questions} questions:
[
    {{
        "question_number": 1,
        "question_text": "Short direct question - NO project prefix, just the question",
        "question_type": "technology_deepdive|implementation_detail|metric_challenge|critical_thinking",
        "difficulty": "medium|hard",
        "category": "Technology or skill being tested (NOT project name)",
        "expected_topics": ["topic1", "topic2"],
        "skill_tags": ["specific_technology"],
        "resume_reference": "What part of resume this tests"
    }}
]

CRITICAL: The question_text should NEVER start with a project name. Just ask the question directly.
Examples:
✓ "Why Celery + Redis over AWS SQS?"
✗ "ClinicSense: Why Celery + Redis over AWS SQS?"

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
