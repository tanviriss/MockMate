'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

interface Resume {
  id: number;
  file_url: string;
  created_at: string;
  parsed_data: {
    name?: string;
    [key: string]: any;
  };
}

export default function ResumeGrillPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No token available');
        setResumes([]);
        setLoading(false);
        return;
      }

      const data = await api.getResumes(token);

      // Backend returns { count, resumes }
      const resumeList = data.resumes || [];
      setResumes(resumeList);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGrill = async () => {
    if (!selectedResume) return;

    setCreating(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/resume-grill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resume_id: selectedResume,
          num_questions: numQuestions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create resume grill');
      }

      const interview = await response.json();
      router.push(`/interviews/${interview.id}`);
    } catch (error) {
      console.error('Failed to create resume grill:', error);
      alert('Failed to create resume grill. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-8 flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Resume Grill 🔥</h1>
              <p className="text-gray-300 text-lg">
                Think you know your resume? Let's see if you can explain everything you wrote.
              </p>
              <p className="text-orange-300 text-sm mt-2">
                This interview will test your deep knowledge of the technologies, projects, and achievements on your resume.
              </p>
            </div>
          </div>

          {/* Resume Selection */}
          <div className="space-y-4">
            <label className="block text-white font-semibold text-lg">
              Select a resume to get grilled on:
            </label>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No resumes found. Upload one first!</p>
                <button
                  onClick={() => router.push('/resumes')}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Upload Resume
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => setSelectedResume(resume.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedResume === resume.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">
                          {resume.parsed_data?.name || 'Resume'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Uploaded {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedResume === resume.id && (
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Number of Questions Slider */}
          {resumes.length > 0 && (
            <div className="mt-8">
              <label className="block text-white font-semibold text-lg mb-2">
                Number of Questions: {numQuestions}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 question</span>
                <span>10 questions</span>
              </div>
            </div>
          )}

          {/* Start Button */}
          {resumes.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleStartGrill}
                disabled={!selectedResume || creating}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  !selectedResume || creating
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transform hover:scale-105'
                }`}
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Questions...
                  </span>
                ) : (
                  "Get Grilled 🔥"
                )}
              </button>
              <p className="text-center text-gray-400 text-sm mt-3">
                This will generate {numQuestions} tough {numQuestions === 1 ? 'question' : 'questions'} about your resume
              </p>
            </div>
          )}
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
