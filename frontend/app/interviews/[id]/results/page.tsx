"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { api } from "@/lib/api";

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

export default function InterviewResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const interviewId = parseInt(resolvedParams.id);
  const router = useRouter();
  const { isReady, getToken } = useClerkAuth();
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
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
    } catch (err: unknown) {
      setError(err.message);
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
    } catch (err: unknown) {
      console.error('Failed to fetch ideal answer:', err);
    } finally {
      setLoadingIdeal(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-500/20 border-green-500/30";
    if (score >= 6) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-300 mb-4">{error || "Results not found"}</p>
          <button
            onClick={() => router.push("/interviews")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
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

    results.results.forEach((result: unknown) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/interviews")}
            className="text-gray-300 hover:text-white mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Interviews
          </button>

          <h1 className="text-4xl font-bold text-white mb-4">
            Interview Results
          </h1>

          {!isEvaluated && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-yellow-200">
              Evaluation in progress... ({results.evaluated_answers}/{results.total_questions} answers evaluated)
            </div>
          )}
        </div>

        {/* Overall Score */}
        {results.overall_score !== null && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 text-center">
            <h2 className="text-xl text-gray-300 mb-4">Overall Score</h2>
            <div className={`text-8xl font-bold ${getScoreColor(results.overall_score)}`}>
              {results.overall_score}
              <span className="text-4xl text-gray-400">/10</span>
            </div>
            <div className="mt-4 text-gray-400">
              Based on {results.evaluated_answers} evaluated answers
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Performance by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">
                    {cat.category}
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(cat.average)}`}>
                    {cat.average.toFixed(1)}
                    <span className="text-xl text-gray-400">/10</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {cat.count} question{cat.count > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Results */}
        <div className="space-y-6">
          {results.results.map((result: unknown, index: number) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{result.question_number}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {result.question_text}
                    </h3>
                  </div>
                  <div className="flex gap-2 ml-13">
                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-full">
                      {result.question_type}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs rounded-full">
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
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Your Answer:</h4>
                <p className="text-gray-200 bg-slate-800/50 rounded-lg p-4">
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
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">💡 Suggestions:</h4>
                      <ul className="space-y-2">
                        {result.evaluation.improvements.map((improvement: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-gray-200">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!result.has_evaluation && (
                <div className="text-center py-8 text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <p>Evaluating...</p>
                </div>
              )}

              {/* Ideal Answer Section */}
              {result.has_evaluation && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  {!idealAnswers[result.question_id] && (
                    <button
                      onClick={() => fetchIdealAnswer(result.question_id)}
                      disabled={loadingIdeal[result.question_id]}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
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
                    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">✨</span>
                        <h4 className="text-lg font-bold text-blue-300">Ideal Answer Example</h4>
                      </div>

                      <div className="space-y-4">
                        {/* Ideal Answer Text */}
                        <div>
                          <p className="text-gray-200 leading-relaxed">
                            {idealAnswers[result.question_id].ideal_answer}
                          </p>
                        </div>

                        {/* Key Points */}
                        {idealAnswers[result.question_id].key_points && idealAnswers[result.question_id].key_points.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-blue-400 mb-2">📌 Key Points to Cover:</h5>
                            <ul className="space-y-1">
                              {idealAnswers[result.question_id].key_points.map((point: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                  <span className="text-blue-400 mt-0.5">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Why This Works */}
                        {idealAnswers[result.question_id].why_this_works && (
                          <div className="bg-slate-800/50 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-green-400 mb-2">💡 Why This Works:</h5>
                            <p className="text-gray-300 text-sm">
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
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition"
          >
            🎯 Practice Again
          </button>
          <button
            onClick={() => router.push("/analytics")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            📊 View Analytics
          </button>
          <button
            onClick={() => router.push("/interviews")}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
          >
            Back to Interviews
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
