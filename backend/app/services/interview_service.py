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

    prompt = f"""You are interviewing a candidate for this SPECIFIC role: {jd_analysis.get('job_title', 'Software Engineer')} at {jd_analysis.get('company', 'the company')}.

CRITICAL REQUIREMENT: Generate EXACTLY {num_questions} questions. No more, no less.

JOB REQUIREMENTS (THE MOST IMPORTANT - BASE QUESTIONS ON THIS):
- Role: {jd_analysis.get('job_title', 'Software Engineer')}
- Level: {jd_analysis.get('experience_level', 'mid')}
- Required Skills: {', '.join(jd_analysis.get('required_skills', [])[:10])}
- Key Responsibilities: {', '.join(jd_analysis.get('key_responsibilities', [])[:5])}

CANDIDATE'S BACKGROUND (only reference if it overlaps with JD requirements):
- Skills: {', '.join(all_skills[:15])}
- Recent Experience:{experience_context}
- Projects:{project_context}

QUESTION STRATEGY:
1. PRIMARY FOCUS (70%): Ask about the JOB REQUIREMENTS - the technologies, skills, and responsibilities mentioned in the job description
2. SECONDARY FOCUS (30%): Connect candidate's background to job requirements ONLY if there's overlap

Examples of GOOD questions for this role:
- "Have you worked with {jd_analysis.get('required_skills', ['Python'])[0] if jd_analysis.get('required_skills') else 'the required technologies'}? Tell me about your experience."
- "This role involves {jd_analysis.get('key_responsibilities', ['building software'])[0] if jd_analysis.get('key_responsibilities') else 'software development'}. Walk me through a similar project you've done."
- "What's your experience with {jd_analysis.get('required_skills', ['cloud platforms'])[1] if len(jd_analysis.get('required_skills', [])) > 1 else 'the tech stack'}?"

CRITICAL RULES:
- Questions MUST be SHORT (1-2 sentences max)
- ONLY ask about technologies/skills mentioned in the JOB DESCRIPTION
- DON'T ask about random technologies from their resume that aren't in the JD
- Focus on what the COMPANY needs, not just what the candidate has done
- DO NOT create long hypothetical scenarios

✅ GOOD QUESTIONS for THIS specific job (keep them this simple):
- "Have you used AWS before? Tell me about your experience." (if AWS is in JD)
- "This role uses Python a lot. What Python projects have you built?"
- "Tell me about your experience with REST APIs."
- "Have you worked in an Agile environment? What was that like?"
- "What do you know about Delta's technology challenges?" (company-specific)
- "Walk me through a time you debugged a production issue."
- "This internship involves Java development. What's your Java experience?"

❌ BAD QUESTIONS (asking about irrelevant tech NOT in the JD):
- "I see you used Redis in MockMate. How did you use it?" (if Redis is NOT mentioned in JD)
- "Tell me about your MongoDB experience." (if JD only mentions Oracle/SQL)
- Asking about ANY technology that's NOT in the job description
- Long hypothetical scenarios: "Let's say you're building a feature that..."

QUESTION TYPES ({num_questions} total) - MIX THEM THROUGHOUT, DON'T GROUP BY TYPE:
1. JD-FOCUSED TECHNICAL (35%) - Ask about technologies/skills IN THE JOB DESCRIPTION
   - "Have you worked with [JD technology]? Tell me about it."
   - "This role uses [JD technology]. What's your experience with it?"
   - "Walk me through how you'd approach [JD responsibility]."

2. BEHAVIORAL (40%) - Past experience questions relevant to the role
   - "Tell me about a time you [did something from JD responsibilities]."
   - "Describe a project where you used [JD technology]."
   - "Have you worked in [JD environment like Agile]? What was that like?"
   - "Tell me about a technical challenge you overcame."
   - "Describe a time you had to learn something quickly."

3. PROJECT DEEP-DIVE (15%) - ONLY if project uses technologies from JD
   - "I saw you used [JD tech] in your [project]. Tell me about that."
   - "How would you apply your [project] experience to this role?"

4. ROLE-SPECIFIC (10%) - Questions about the actual job
   - "Why do you want to work at [company]?"
   - "What interests you about this role?"
   - "How would you handle [common scenario from JD]?"

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

Return a JSON array with EXACTLY {num_questions} questions:
[
    {{
        "question_number": 1,
        "question_text": "Short, natural question here",
        "question_type": "technical|behavioral|project_deepdive|system_design",
        "difficulty": "easy|medium|hard",
        "category": "Specific skill (e.g., 'FastAPI', 'Team Collaboration', 'React')",
        "expected_topics": ["topic1", "topic2", "topic3"],
        "skill_tags": ["skill1", "skill2"]
    }},
    ... (continue until you have EXACTLY {num_questions} questions)
]

REMINDER: Return EXACTLY {num_questions} questions in the array.
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
