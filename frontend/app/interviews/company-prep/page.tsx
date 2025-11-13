'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

interface Resume {
  id: number;
  parsed_data: unknown;
  created_at: string;
}

export default function CompanyPrepPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    resume_id: '',
    target_company: '',
    target_role: '',
    num_questions: 5
  });

  useEffect(() => {
    if (!token) {
      router.push('/sign-in');
      return;
    }
    fetchResumes();
  }, [token, router]);

  const fetchResumes = async () => {
    try {
      setLoading(false);
      const data = await api.getResumes(token!);
      setResumes(data.resumes || []);

      if (data.resumes && data.resumes.length > 0) {
        setFormData(prev => ({ ...prev, resume_id: data.resumes[0].id.toString() }));
      }
    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resume_id) {
      setError('Please select a resume');
      return;
    }

    if (!formData.target_company.trim()) {
      setError('Please enter a target company');
      return;
    }

    if (!formData.target_role.trim()) {
      setError('Please enter a target role');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const response = await api.createInterview(
        {
          resume_id: parseInt(formData.resume_id),
          job_description: `Company-specific prep for ${formData.target_role} at ${formData.target_company}`,
          num_questions: formData.num_questions,
          target_company: formData.target_company,
          target_role: formData.target_role
        },
        token!
      );

      sessionStorage.setItem(`interview_${response.id}`, JSON.stringify(response));
      router.push(`/interviews/${response.id}`);
    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300">Loading...</p>
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
              onClick={() => router.push('/interviews/new')}
              className="text-gray-300 hover:text-white transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Interview Options
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">🎯</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Company-Specific Prep
          </h1>
        </div>
        <p className="text-xl text-gray-300 mb-12">
          Get interview questions tailored to a specific company by researching recent experiences from Glassdoor, Reddit, and more
        </p>

        {resumes.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Resumes Found</h3>
            <p className="text-gray-400 mb-6">You need to upload a resume before creating an interview.</p>
            <button
              onClick={() => router.push('/resumes')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Upload Resume
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Resume Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Select Resume
                </label>
                <select
                  value={formData.resume_id}
                  onChange={(e) => setFormData({ ...formData, resume_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id} className="bg-slate-800">
                      {resume.parsed_data?.name || `Resume ${resume.id}`} - {new Date(resume.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Company & Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Target Company *
                  </label>
                  <input
                    type="text"
                    value={formData.target_company}
                    onChange={(e) => setFormData({ ...formData, target_company: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., Google, Amazon, Meta"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Target Role *
                  </label>
                  <input
                    type="text"
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., Software Engineer, PM"
                    required
                  />
                </div>
              </div>

              {/* Info about web scraping */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-blue-400">🌐 Real Questions from the Web</span>
                  <br />
                  We'll search Reddit, LeetCode, and other sources for actual interview questions from {formData.target_company || 'your target company'} and generate questions based on real interview experiences.
                </p>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Number of Questions: {formData.num_questions}
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={formData.num_questions}
                  onChange={(e) => setFormData({ ...formData, num_questions: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 question</span>
                  <span>15 questions</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {creating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Researching & Generating Questions...
                  </span>
                ) : (
                  'Generate Company-Specific Questions'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
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
