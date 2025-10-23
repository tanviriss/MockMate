"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function InterviewResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const interviewId = parseInt(resolvedParams.id);
  const router = useRouter();
  const { token } = useAuthStore();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    fetchResults();
  }, [token, interviewId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await api.getInterviewResults(interviewId, token!);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

        {/* Question Results */}
        <div className="space-y-6">
          {results.results.map((result: any, index: number) => (
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
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
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
