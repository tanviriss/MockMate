"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { api } from "@/lib/api";
import LoadingMessages from "@/components/LoadingMessages";
import SpeakingAnalysisCard from "@/components/SpeakingAnalysis";

interface IdealAnswer {
  ideal_answer: string;
  key_points: string[];
  structure: {
    opening: string;
    body: string;
    closing: string;
  };
  why_this_works: string;
}

interface SpeakingAnalysis {
  words_per_minute: number | null;
  total_words: number;
  filler_words: { [key: string]: number };
  total_filler_count: number;
  filler_percentage: number;
  speaking_pace_feedback: string;
  filler_word_feedback: string;
}

interface Evaluation {
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  weaknesses?: string[];
  key_points_covered?: string[];
  speaking_analysis?: SpeakingAnalysis;
}

interface QuestionResult {
  question_id: number;
  question_number?: number;
  question_text: string;
  question_type: string;
  question_category?: string;
  user_answer?: string;
  answer_transcript?: string;
  score: number | null;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  has_evaluation?: boolean;
  evaluation?: Evaluation;
}

interface InterviewResults {
  interview_id: number;
  total_questions: number;
  evaluated_answers: number;
  overall_score: number | null;
  results: QuestionResult[];
  [key: string]: unknown;
}

export default function InterviewResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const interviewId = parseInt(resolvedParams.id);
  const router = useRouter();
  const { isReady, getToken } = useClerkAuth();
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [idealAnswers, setIdealAnswers] = useState<{ [key: number]: IdealAnswer }>({});
  const [loadingIdeal, setLoadingIdeal] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (isReady) {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, interviewId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await api.getInterviewResults(interviewId, token);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchIdealAnswer = async (questionId: number) => {
    if (idealAnswers[questionId] || loadingIdeal[questionId]) return;

    try {
      setLoadingIdeal(prev => ({ ...prev, [questionId]: true }));
      const token = await getToken();
      if (!token) return;
      const data = await api.getIdealAnswer(questionId, token);
      setIdealAnswers(prev => ({ ...prev, [questionId]: data.ideal_answer }));
    } catch (err) {
      console.error('Failed to fetch ideal answer:', err);
    } finally {
      setLoadingIdeal(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (score >= 6) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  };

  if (loading) {
    return <LoadingMessages interval={1500} />;
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-700 dark:text-red-300 mb-4">{error || "Results not found"}</p>
          <button
            onClick={() => router.push("/interviews")}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const isEvaluated = results.evaluated_answers === results.total_questions;

  // Calculate category breakdown
  const getCategoryBreakdown = () => {
    const categories: { [key: string]: { scores: number[], count: number } } = {};

    results.results.forEach((result) => {
      if (result.score !== null && result.score !== undefined) {
        const category = result.question_type || 'general';
        if (!categories[category]) {
          categories[category] = { scores: [], count: 0 };
        }
        categories[category].scores.push(result.score);
        categories[category].count++;
      }
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      average: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      count: data.count
    }));
  };

  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/interviews")}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Interviews
          </button>

          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Interview Results
          </h1>

          {!isEvaluated && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-700 dark:text-yellow-200">
              Evaluation in progress... ({results.evaluated_answers}/{results.total_questions} answers evaluated)
            </div>
          )}
        </div>

        {/* Overall Score */}
        {results.overall_score !== null && (
          <div className="bg-white dark:bg-slate-900 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl p-8 mb-8 text-center">
            <h2 className="text-xl text-slate-600 dark:text-slate-400 mb-4">Overall Score</h2>
            <div className={`text-8xl font-bold ${getScoreColor(results.overall_score)}`}>
              {results.overall_score}
              <span className="text-4xl text-slate-500 dark:text-slate-400">/10</span>
            </div>
            <div className="mt-4 text-slate-500 dark:text-slate-400">
              Based on {results.evaluated_answers} evaluated answers
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-white dark:bg-slate-900 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Performance by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    {cat.category}
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(cat.average)}`}>
                    {cat.average.toFixed(1)}
                    <span className="text-xl text-slate-500 dark:text-slate-400">/10</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {cat.count} question{cat.count > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Results */}
        <div className="space-y-6">
          {results.results.map((result, index: number) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl p-6"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{result.question_number}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {result.question_text}
                    </h3>
                  </div>
                  <div className="flex gap-2 ml-13">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {result.question_type}
                    </span>
                    <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                      {result.question_category}
                    </span>
                  </div>
                </div>

                {result.score !== null && (
                  <div className={`px-6 py-3 border rounded-xl ${getScoreBgColor(result.score)}`}>
                    <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}/10
                    </div>
                  </div>
                )}
              </div>

              {/* Answer */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Your Answer:</h4>
                <p className="text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  {result.answer_transcript}
                </p>
              </div>

              {/* Evaluation */}
              {result.evaluation && (
                <div className="space-y-4">
                  {/* Feedback */}
                  {result.evaluation.feedback && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Feedback:</h4>
                      <p className="text-gray-200">{result.evaluation.feedback}</p>
                    </div>
                  )}

                  {/* Strengths */}
                  {result.evaluation.strengths && result.evaluation.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Strengths:</h4>
                      <ul className="space-y-2">
                        {result.evaluation.strengths.map((strength: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-gray-200">
                            <span className="text-green-400 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {result.evaluation.weaknesses && result.evaluation.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 mb-2">✗ Areas to Improve:</h4>
                      <ul className="space-y-2">
                        {result.evaluation.weaknesses.map((weakness: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-gray-200">
                            <span className="text-red-400 mt-1">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {result.evaluation.improvements && result.evaluation.improvements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">💡 Suggestions:</h4>
                      <ul className="space-y-2">
                        {result.evaluation.improvements.map((improvement: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                            <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Speaking Analysis */}
              {result.evaluation?.speaking_analysis && (
                <div className="mt-6">
                  <SpeakingAnalysisCard analysis={result.evaluation.speaking_analysis} />
                </div>
              )}

              {!result.has_evaluation && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 mb-2"></div>
                  <p>Evaluating...</p>
                </div>
              )}

              {/* Ideal Answer Section */}
              {result.has_evaluation && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  {!idealAnswers[result.question_id] && (
                    <button
                      onClick={() => fetchIdealAnswer(result.question_id)}
                      disabled={loadingIdeal[result.question_id]}
                      className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      {loadingIdeal[result.question_id] ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          <span>Generating Ideal Answer...</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>Show Ideal Answer Example</span>
                        </>
                      )}
                    </button>
                  )}

                  {idealAnswers[result.question_id] && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">✨</span>
                        <h4 className="text-lg font-bold text-blue-700 dark:text-blue-300">Ideal Answer Example</h4>
                      </div>

                      <div className="space-y-4">
                        {/* Ideal Answer Text */}
                        <div>
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                            {idealAnswers[result.question_id].ideal_answer}
                          </p>
                        </div>

                        {/* Key Points */}
                        {idealAnswers[result.question_id].key_points && idealAnswers[result.question_id].key_points.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">📌 Key Points to Cover:</h5>
                            <ul className="space-y-1">
                              {idealAnswers[result.question_id].key_points.map((point: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Why This Works */}
                        {idealAnswers[result.question_id].why_this_works && (
                          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">💡 Why This Works:</h5>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                              {idealAnswers[result.question_id].why_this_works}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.push("/interviews/new")}
            className="px-6 py-3 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            🎯 Practice Again
          </button>
          <button
            onClick={() => router.push("/analytics")}
            className="px-6 py-3 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            📊 View Analytics
          </button>
          <button
            onClick={() => router.push("/interviews")}
            className="px-6 py-3 bg-slate-600 dark:bg-slate-500 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Back to Interviews
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
