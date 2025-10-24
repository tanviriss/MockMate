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

    prompt = f"""You are a senior technical interviewer at a top tech company (Google, Meta, Amazon level). Your job is to generate realistic, specific interview questions that actual interviewers ask.

CANDIDATE BACKGROUND:
- Skills: {', '.join(all_skills[:15])}
- Recent Experience:{experience_context}
- Key Projects:{project_context}

JOB DESCRIPTION:
- Role: {jd_analysis.get('job_title', 'Software Engineer')}
- Required Skills: {', '.join(jd_analysis.get('required_skills', [])[:10])}
- Level: {jd_analysis.get('experience_level', 'mid-level')}
- Responsibilities: {', '.join(jd_analysis.get('key_responsibilities', [])[:3])}

CRITICAL REQUIREMENTS FOR QUESTION QUALITY:

1. **Technical Questions** - Must be specific and practical:
   ❌ BAD: "Explain how Python works"
   ✅ GOOD: "You mentioned using FastAPI in your resume. Walk me through how you'd design a rate-limiting middleware for a REST API. What data structure would you use and why?"

2. **Behavioral Questions** - Use STAR method, reference their actual experience:
   ❌ BAD: "Tell me about a time you worked on a team"
   ✅ GOOD: "I see you worked as a Software Engineer at {experiences[0].get('company', 'TechCorp') if experiences else 'your previous company'}. Tell me about a time when you had to resolve a major production bug. What was the situation, your approach, and the outcome?"

3. **System Design Questions** - Tie to job responsibilities:
   ❌ BAD: "Design Twitter"
   ✅ GOOD: "This role involves building scalable backend services. Design a notification system that can handle 1M users with real-time push notifications. Walk through your database schema, API design, and how you'd handle scale."

4. **Project Deep-Dive** - Reference their actual projects:
   ❌ BAD: "Tell me about a project"
   ✅ GOOD: "I noticed your {projects[0].get('name', 'e-commerce') if projects else 'personal'} project used {projects[0].get('technologies', ['React'])[0] if projects and projects[0].get('technologies') else 'modern tech'}. What was the biggest technical challenge you faced and how did you solve it?"

5. **Situational/Problem-Solving** - Real scenarios from the job:
   ❌ BAD: "How do you handle deadlines?"
   ✅ GOOD: "You're two weeks from launch and QA finds a critical security vulnerability in the authentication system. The fix will take 3 weeks. Walk me through your decision-making process."

QUESTION MIX for {num_questions} questions:
- 40% Technical (coding, architecture, system design)
- 30% Behavioral (STAR method, past experiences)
- 20% Project Deep-Dives (their resume projects)
- 10% Situational (hypothetical scenarios)

DIFFICULTY PROGRESSION:
- Questions 1-3: Medium (warm-up)
- Questions 4-7: Medium-Hard (core assessment)
- Questions 8-{num_questions}: Hard (stretch questions)

Generate {num_questions} questions following this exact JSON structure:

[
    {{
        "question_number": 1,
        "question_text": "Specific, detailed question that references their background or job requirements",
        "question_type": "technical|behavioral|situational|project_deepdive",
        "difficulty": "medium|hard",
        "category": "Specific skill name (e.g., 'Python/FastAPI', 'System Design', 'Team Collaboration')",
        "expected_topics": ["specific topic 1", "specific topic 2", "specific topic 3"],
        "skill_tags": ["skill1", "skill2", "skill3"]
    }}
]

SKILL TAGS should be specific technical or soft skills being assessed:
- Technical: "Python", "PostgreSQL", "System Design", "API Design", "Docker", "React"
- Soft Skills: "Communication", "Leadership", "Problem Solving", "Conflict Resolution"
- Be specific (e.g., "FastAPI" not just "Python", "Database Optimization" not just "SQL")

MAKE QUESTIONS SOUND NATURAL - like a real human interviewer would ask them.
Reference their actual resume items whenever possible.
Avoid generic textbook questions.

Return ONLY the JSON array, no markdown, no explanations."""

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
