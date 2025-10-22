'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

interface Question {
  question_number: number;
  question_text: string;
  question_type: string;
  difficulty: string;
  category: string;
  expected_topics: string[];
}

export default function InterviewDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuthStore();
  const [interview, setInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    // Get interview data from session storage if available
    const cachedData = sessionStorage.getItem(`interview_${params.id}`);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      setInterview(data);
      setQuestions(data.questions || []);
      setLoading(false);
    } else {
      fetchInterview();
    }
  }, [token, params.id, router]);

  const fetchInterview = async () => {
    try {
      setLoading(true);
      const data = await api.getInterview(parseInt(params.id as string), token!);
      setInterview(data);
      setQuestions(data.questions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'hard': return 'bg-red-500/20 border-red-500/30 text-red-300';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'technical': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'behavioral': return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
      case 'situational': return 'bg-pink-500/20 border-pink-500/30 text-pink-300';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-300 mb-4">{error || 'Interview not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => router.push('/dashboard')}>
              <Logo />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-300 hover:text-white transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Interview Questions
          </h1>
          <p className="text-xl text-gray-300">
            {interview.jd_analysis?.job_title || 'Interview'} - {questions.length} Questions
          </p>
        </div>

        {/* Job Analysis */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Job Analysis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {interview.jd_analysis?.job_title && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Position</p>
                <p className="text-white font-medium">{interview.jd_analysis.job_title}</p>
              </div>
            )}
            {interview.jd_analysis?.experience_level && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Experience Level</p>
                <p className="text-white font-medium capitalize">{interview.jd_analysis.experience_level}</p>
              </div>
            )}
            {interview.jd_analysis?.required_skills && interview.jd_analysis.required_skills.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {interview.jd_analysis.required_skills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.question_number} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{question.question_number}</span>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 border text-xs font-semibold rounded-full ${getTypeColor(question.question_type)}`}>
                      {question.question_type}
                    </span>
                    <span className={`px-3 py-1 border text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold rounded-full">
                      {question.category}
                    </span>
                  </div>

                  <p className="text-white text-lg mb-4 leading-relaxed">
                    {question.question_text}
                  </p>

                  {question.expected_topics && question.expected_topics.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">Expected Topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {question.expected_topics.map((topic: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/interviews/new')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Create Another Interview
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </main>
  );
}
