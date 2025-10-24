"""
Analytics endpoints for tracking progress and insights
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database import get_db
from app.dependencies import get_current_user
from app.models.interview import Interview
from app.models.question import Question
from app.models.answer import Answer

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/progress")
async def get_progress(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get user's progress analytics

    Returns:
    - Total interviews completed
    - Average score
    - Score history over time
    - Category performance
    - Improvement rate
    - AI-generated insights
    """

    # Get all completed interviews for the user
    interviews = db.query(Interview).filter(
        Interview.user_id == current_user.id,
        Interview.status == "COMPLETED",
        Interview.overall_score.isnot(None)
    ).order_by(Interview.completed_at).all()

    if not interviews:
        return {
            "total_interviews": 0,
            "average_score": None,
            "improvement_rate": None,
            "best_category": None,
            "score_history": [],
            "category_performance": [],
            "insights": []
        }

    # Calculate total interviews and average score
    total_interviews = len(interviews)
    scores = [i.overall_score for i in interviews if i.overall_score is not None]
    average_score = sum(scores) / len(scores) if scores else None

    # Calculate improvement rate (compare last 3 vs first 3 interviews)
    improvement_rate = None
    if len(scores) >= 6:
        first_three_avg = sum(scores[:3]) / 3
        last_three_avg = sum(scores[-3:]) / 3
        if first_three_avg > 0:
            improvement_rate = ((last_three_avg - first_three_avg) / first_three_avg) * 100

    # Score history (last 10 interviews)
    score_history = [
        {
            "date": interview.completed_at.isoformat() if interview.completed_at else interview.created_at.isoformat(),
            "score": interview.overall_score,
            "interview_id": interview.id
        }
        for interview in interviews[-10:]
    ]

    # Category performance
    category_stats = {}

    for interview in interviews:
        # Get all questions and answers for this interview
        questions = db.query(Question).filter(
            Question.interview_id == interview.id
        ).all()

        for question in questions:
            answer = db.query(Answer).filter(
                Answer.question_id == question.id,
                Answer.score.isnot(None)
            ).first()

            if answer and answer.score is not None:
                category = question.question_context.get('question_type', 'general')

                if category not in category_stats:
                    category_stats[category] = {
                        'scores': [],
                        'count': 0
                    }

                category_stats[category]['scores'].append(answer.score)
                category_stats[category]['count'] += 1

    # Convert to list format
    category_performance = [
        {
            "category": category,
            "average_score": sum(data['scores']) / len(data['scores']),
            "count": data['count']
        }
        for category, data in category_stats.items()
    ]

    # Sort by average score descending
    category_performance.sort(key=lambda x: x['average_score'], reverse=True)

    # Best category
    best_category = category_performance[0]['category'] if category_performance else None

    # Generate AI insights
    insights = generate_insights(
        total_interviews=total_interviews,
        average_score=average_score,
        improvement_rate=improvement_rate,
        category_performance=category_performance,
        score_history=scores
    )

    return {
        "total_interviews": total_interviews,
        "average_score": average_score,
        "improvement_rate": improvement_rate,
        "best_category": best_category,
        "score_history": score_history,
        "category_performance": category_performance,
        "insights": insights
    }


def generate_insights(
    total_interviews: int,
    average_score: float,
    improvement_rate: float,
    category_performance: list,
    score_history: list
) -> list:
    """Generate AI-powered insights based on analytics data"""
    insights = []

    # Milestone insights
    if total_interviews >= 10:
        insights.append(f"🎉 Congratulations! You've completed {total_interviews} interviews. That's dedication!")
    elif total_interviews >= 5:
        insights.append(f"Great progress! You've completed {total_interviews} interviews. Keep it up!")

    # Score performance insights
    if average_score is not None:
        if average_score >= 8:
            insights.append("🌟 Excellent performance! Your average score is in the top tier.")
        elif average_score >= 6:
            insights.append("👍 Good work! Your average score shows solid performance.")
        else:
            insights.append("💪 Keep practicing! Each interview is a learning opportunity.")

    # Improvement insights
    if improvement_rate is not None:
        if improvement_rate > 20:
            insights.append(f"📈 Amazing improvement! You've improved by {improvement_rate:.1f}% from your early interviews.")
        elif improvement_rate > 0:
            insights.append(f"📊 You're trending upward with {improvement_rate:.1f}% improvement. Keep going!")
        elif improvement_rate < -10:
            insights.append("🎯 Recent scores have dipped. Consider reviewing your strongest interview performances.")

    # Category-specific insights
    if category_performance:
        best_cat = category_performance[0]
        insights.append(f"⭐ Your strongest area is {best_cat['category']} with an average of {best_cat['average_score']:.1f}/10.")

        if len(category_performance) > 1:
            weakest_cat = category_performance[-1]
            if weakest_cat['average_score'] < 5:
                insights.append(f"💡 Focus on improving {weakest_cat['category']} questions - currently at {weakest_cat['average_score']:.1f}/10.")

    # Consistency insights
    if len(score_history) >= 5:
        recent_scores = score_history[-5:]
        score_variance = max(recent_scores) - min(recent_scores)

        if score_variance < 2:
            insights.append("✅ Your performance is very consistent across recent interviews.")
        elif score_variance > 4:
            insights.append("🎲 Your scores vary significantly. Try to identify what makes your best interviews successful.")

    # Encouragement for low activity
    if total_interviews < 3:
        insights.append("🚀 Complete more interviews to unlock detailed insights and track your progress over time!")

    return insights
