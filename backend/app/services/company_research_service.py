"""
Company-specific interview research service
Searches the web for real interview questions from Glassdoor, Reddit, Blind
"""
import google.generativeai as genai
from app.config import settings
import json

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')


async def research_company_interview_questions(
    company_name: str,
    role: str,
    num_questions: int = 5
) -> dict:
    """
    Research company-specific interview questions using web search

    Args:
        company_name: Target company (e.g., "Google", "Amazon")
        role: Job role (e.g., "Software Engineer", "Product Manager")
        num_questions: Number of questions to generate based on research

    Returns:
        Dict with researched questions and company culture insights
    """

    # Use Gemini's built-in Google Search grounding
    # This searches the web and grounds responses in real data
    prompt = f"""Search the web for recent {company_name} {role} interview questions and experiences.

Look for information from:
- Glassdoor interview experiences
- Reddit r/cscareerquestions posts
- Blind app discussions
- LeetCode company discussion threads
- Recent interview prep sites

Based on your web search findings, provide:

1. **Real Questions Asked**: What actual questions are candidates reporting from {company_name} {role} interviews in the last 1-2 years?

2. **Company Culture & Values**: What does {company_name} value in candidates based on recent interviews?

3. **Interview Format**: How are {company_name} {role} interviews typically structured?

4. **Common Themes**: What topics/skills are frequently assessed?

Return your findings in this JSON format:
{{
    "company_culture": {{
        "values": ["value1", "value2", "value3"],
        "interview_style": "description of interview approach"
    }},
    "common_question_themes": ["theme1", "theme2", "theme3"],
    "example_questions": [
        "Actual question 1 from research",
        "Actual question 2 from research",
        "Actual question 3 from research"
    ],
    "technical_focus_areas": ["area1", "area2", "area3"],
    "behavioral_focus": ["focus1", "focus2"],
    "sources": "Brief mention of where you found this info"
}}

Focus on RECENT information (2023-2025) and SPECIFIC to {role} role.
Return ONLY the JSON, no markdown."""

    try:
        # Enable Google Search grounding for real-time web data
        response = model.generate_content(
            prompt,
            tools='google_search_retrieval'  # This enables web search
        )

        # Parse response
        result_text = response.text.strip()

        # Remove markdown if present
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]

        research_data = json.loads(result_text.strip())

        return {
            "company_name": company_name,
            "role": role,
            "research_data": research_data,
            "data_freshness": "Based on recent web search (last 1-2 years)"
        }

    except Exception as e:
        print(f"Error researching company questions: {e}")
        # Fallback to generic response
        return {
            "company_name": company_name,
            "role": role,
            "research_data": {
                "company_culture": {
                    "values": ["Innovation", "Collaboration", "Excellence"],
                    "interview_style": "Standard behavioral and technical interviews"
                },
                "common_question_themes": ["Past experience", "Problem solving", "Teamwork"],
                "example_questions": [],
                "technical_focus_areas": ["System Design", "Coding", "Architecture"],
                "behavioral_focus": ["Leadership", "Communication"],
                "sources": "Unable to fetch recent data"
            },
            "data_freshness": "Fallback - generic data"
        }


async def generate_company_specific_questions(
    company_name: str,
    role: str,
    resume_data: dict,
    jd_analysis: dict,
    num_questions: int = 10
) -> list:
    """
    Generate interview questions based on real company research
    """

    # First, research the company
    research = await research_company_interview_questions(company_name, role, num_questions)
    research_data = research["research_data"]

    # Extract candidate context
    skills = resume_data.get('technical_skills', {})
    all_skills = []
    if skills:
        all_skills.extend(skills.get('languages', []))
        all_skills.extend(skills.get('frameworks_libraries', []))
        all_skills.extend(skills.get('cloud_databases', []))

    experiences = resume_data.get('experience', [])
    projects = resume_data.get('projects', [])

    # Build experience context
    experience_context = ""
    if experiences:
        for exp in experiences[:3]:
            experience_context += f"\n- {exp.get('title', '')} at {exp.get('company', '')}: {', '.join(exp.get('responsibilities', [])[:2])}"

    project_context = ""
    if projects:
        for proj in projects[:2]:
            project_context += f"\n- {proj.get('name', '')}: {', '.join(proj.get('description', [])[:1])}"

    # Generate questions using research context
    prompt = f"""You are a {company_name} interviewer for a {role} position.

**COMPANY RESEARCH (from recent web sources):**
Culture Values: {', '.join(research_data['company_culture']['values'])}
Interview Style: {research_data['company_culture']['interview_style']}
Common Themes: {', '.join(research_data['common_question_themes'])}
Technical Focus: {', '.join(research_data['technical_focus_areas'])}
Behavioral Focus: {', '.join(research_data['behavioral_focus'])}

**EXAMPLE REAL QUESTIONS FROM {company_name.upper()} INTERVIEWS:**
{chr(10).join(['- ' + q for q in research_data['example_questions'][:5]])}

**CANDIDATE BACKGROUND:**
Skills: {', '.join(all_skills[:15])}
Experience:{experience_context}
Projects:{project_context}

**JOB REQUIREMENTS:**
Role: {jd_analysis.get('job_title', role)}
Required Skills: {', '.join(jd_analysis.get('required_skills', [])[:10])}

Generate {num_questions} interview questions that:
1. **Match {company_name}'s actual interview style** based on the research above
2. **Assess their culture values** (use the themes from real questions)
3. **Reference the candidate's background** when possible
4. **Sound like real {company_name} interviewers** (use similar phrasing to example questions)
5. **Mix question types**:
   - 40% Technical/System Design
   - 30% Behavioral (matching company values)
   - 20% Project Deep-Dives
   - 10% Situational

Return JSON array:
[
    {{
        "question_number": 1,
        "question_text": "Natural question that sounds like {company_name} interviewer",
        "question_type": "technical|behavioral|situational|project_deepdive",
        "difficulty": "medium|hard",
        "category": "Specific skill/value",
        "expected_topics": ["topic1", "topic2", "topic3"],
        "skill_tags": ["skill1", "skill2"],
        "company_value_assessed": "Which {company_name} value this tests"
    }}
]

Make questions realistic for {company_name} {role} interviews.
Return ONLY JSON array, no markdown."""

    response = model.generate_content(prompt)

    # Parse response
    result_text = response.text.strip()
    if result_text.startswith('```json'):
        result_text = result_text[7:]
    if result_text.startswith('```'):
        result_text = result_text[3:]
    if result_text.endswith('```'):
        result_text = result_text[:-3]

    questions = json.loads(result_text.strip())

    # Add research metadata to each question
    for q in questions:
        q['company_specific'] = True
        q['target_company'] = company_name
        q['based_on_research'] = True

    return questions
