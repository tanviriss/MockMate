'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, UserButton } from '@clerk/nextjs';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

interface DashboardStats {
  resumes_uploaded: number;
  interviews_completed: number;
  questions_practiced: number;
  average_score: number | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const fetchStats = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const data = await api.getDashboardStats(token);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isLoaded, isSignedIn, router, getToken]);

  if (!isLoaded || !isSignedIn || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-800">
      {/* Neutral slate theme background */}
      <div className="fixed inset-0 z-0 bg-slate-100 dark:bg-slate-800">
        {/* Subtle colored accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-200/50 dark:bg-slate-700/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-200/40 dark:bg-slate-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex items-center gap-6">
              <span className="text-slate-600 dark:text-slate-400 text-sm">
                {user.fullName || user.primaryEmailAddress?.emailAddress}
              </span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome back, {user.firstName || 'there'}!
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Ready to practice and ace your next interview?
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* My Resumes Card */}
          <button
            onClick={() => router.push('/resumes')}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-blue-500 dark:bg-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">My Resumes</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Upload and manage your resumes with AI-powered parsing
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                Manage resumes
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Practice Interview Card */}
          <button
            onClick={() => router.push('/interviews/new')}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-purple-500 dark:bg-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Create Interview</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Generate AI interview questions based on job description
              </p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                Start interview
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Resume Grill Card */}
          <button
            onClick={() => router.push('/interviews/resume-grill')}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-amber-500 dark:bg-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Resume Grill</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Think you know your resume? Get grilled on what you wrote
              </p>
              <div className="flex items-center text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-2 transition-transform">
                Get grilled
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Company-Specific Prep Card */}
          <button
            onClick={() => router.push('/interviews/company-prep')}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-emerald-500 dark:bg-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Company Prep</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Practice with company-specific questions from Google, Meta, Amazon
              </p>
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-2 transition-transform">
                Start preparing
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* My Interviews Card */}
          <button
            onClick={() => router.push('/interviews')}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 dark:bg-pink-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-pink-500 dark:bg-pink-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">My Interviews</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                View and manage all your interview sessions
              </p>
              <div className="flex items-center text-pink-600 dark:text-pink-400 font-semibold group-hover:translate-x-2 transition-transform">
                View interviews
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Analytics Card */}
          <button
            onClick={() => router.push('/analytics')}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-cyan-500 dark:bg-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Track your progress and get AI-powered insights
              </p>
              <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform">
                View analytics
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Interview Guides Card */}
          <button
            onClick={() => router.push('/guides')}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-indigo-500 dark:bg-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Interview Guides</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Expert tips and strategies to ace your interviews
              </p>
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-2 transition-transform">
                Browse guides
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Resumes Uploaded</p>
            {loading ? (
              <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.resumes_uploaded || 0}</p>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Interviews Completed</p>
            {loading ? (
              <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.interviews_completed || 0}</p>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Questions Practiced</p>
            {loading ? (
              <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.questions_practiced || 0}</p>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Average Score</p>
            {loading ? (
              <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats?.average_score ? `${stats.average_score}/10` : '-'}
              </p>
            )}
          </div>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
