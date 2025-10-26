"""
Web scraper for interview questions from Glassdoor, Reddit, Blind, etc.
"""
import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict
import re
import json


async def search_glassdoor_questions(company: str, role: str) -> List[str]:
    """
    Search for interview questions on Glassdoor
    Note: Glassdoor may block scraping, this is a basic implementation
    """
    questions = []

    # For now, we'll use a search engine approach
    # Format: "site:glassdoor.com [company] [role] interview questions"

    # This is a placeholder - actual implementation would need:
    # 1. Use SerpAPI or similar service
    # 2. Or use Selenium for JavaScript rendering
    # 3. Handle rate limiting and blocking

    return questions


async def search_reddit_questions(company: str, role: str) -> List[str]:
    """
    Search Reddit for interview questions
    Uses Reddit's search API (no auth needed for public posts)
    """
    questions = []

    try:
        search_query = f"{company} {role} interview"
        url = f"https://www.reddit.com/search.json?q={search_query}+subreddit:cscareerquestions&limit=25&sort=relevance"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()

                    for post in data.get('data', {}).get('children', []):
                        post_data = post.get('data', {})
                        title = post_data.get('title', '')
                        selftext = post_data.get('selftext', '')

                        # Extract questions from post text
                        text = f"{title}\n{selftext}"

                        # Look for question patterns
                        question_patterns = [
                            r'"([^"]*\?)"',  # Questions in quotes
                            r'(?:asked|question was|they asked me):\s*([^\.]+\?)',  # "they asked: ..."
                            r'(?:Q\d*:|Question \d*:)\s*([^\n]+\?)',  # Q1: or Question:
                        ]

                        for pattern in question_patterns:
                            matches = re.findall(pattern, text, re.IGNORECASE)
                            questions.extend(matches)

    except Exception as e:
        print(f"Error searching Reddit: {e}")

    return questions[:10]  # Return top 10


async def search_leetcode_discuss(company: str) -> List[str]:
    """
    Search LeetCode company discussion for interview questions
    """
    questions = []

    try:
        # LeetCode has company-specific discuss pages
        company_slug = company.lower().replace(' ', '-')
        url = f"https://leetcode.com/discuss/interview-experience?currentPage=1&orderBy=hot&query={company}"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')

                    # Look for question patterns in discussion titles and content
                    # This is simplified - actual implementation would parse the page structure
                    text = soup.get_text()

                    question_patterns = [
                        r'"([^"]*\?)"',
                        r'(?:Question|Problem):\s*([^\n]+\?)',
                    ]

                    for pattern in question_patterns:
                        matches = re.findall(pattern, text, re.IGNORECASE)
                        questions.extend(matches)

    except Exception as e:
        print(f"Error searching LeetCode: {e}")

    return questions[:10]


async def scrape_interview_questions(company: str, role: str) -> Dict[str, List[str]]:
    """
    Scrape interview questions from multiple sources

    Returns:
        Dict with sources and their questions
    """

    print(f"🔍 Scraping interview questions for {company} {role}...")

    # Run all scrapers in parallel
    reddit_task = search_reddit_questions(company, role)
    leetcode_task = search_leetcode_discuss(company)

    reddit_questions, leetcode_questions = await asyncio.gather(
        reddit_task,
        leetcode_task,
        return_exceptions=True
    )

    # Handle exceptions
    if isinstance(reddit_questions, Exception):
        reddit_questions = []
    if isinstance(leetcode_questions, Exception):
        leetcode_questions = []

    # Clean and deduplicate questions
    all_questions = []
    seen = set()

    for q in reddit_questions + leetcode_questions:
        q_clean = q.strip()
        if q_clean and len(q_clean) > 20 and q_clean not in seen:  # Filter out too short
            all_questions.append(q_clean)
            seen.add(q_clean)

    print(f"✅ Found {len(all_questions)} unique questions from web scraping")

    return {
        "reddit": reddit_questions if not isinstance(reddit_questions, Exception) else [],
        "leetcode": leetcode_questions if not isinstance(leetcode_questions, Exception) else [],
        "all_questions": all_questions,
        "total_found": len(all_questions)
    }
