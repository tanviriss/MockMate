'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
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
  const { user, token, isAuthenticated, clearAuth, _hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      if (!token) return;

      try {
        const data = await api.getDashboardStats(token);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, token, router, _hasHydrated]);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex items-center gap-6">
              <span className="text-gray-300 text-sm">
                {user.full_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-300 hover:text-white transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back, {user.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-xl text-gray-300">
            Ready to practice and ace your next interview?
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* My Resumes Card */}
          <button
            onClick={() => router.push('/resumes')}
            className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">My Resumes</h3>
              <p className="text-gray-300 mb-4">
                Upload and manage your resumes with AI-powered parsing
              </p>
              <div className="flex items-center text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
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
            className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Create Interview</h3>
              <p className="text-gray-300 mb-4">
                Generate AI interview questions based on job description
              </p>
              <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                Start interview
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* My Interviews Card */}
          <button
            onClick={() => router.push('/interviews')}
            className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">My Interviews</h3>
              <p className="text-gray-300 mb-4">
                View and manage all your interview sessions
              </p>
              <div className="flex items-center text-pink-400 font-semibold group-hover:translate-x-2 transition-transform">
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
            className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all hover:scale-105 transform text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Analytics</h3>
              <p className="text-gray-300 mb-4">
                Track your progress and get AI-powered insights
              </p>
              <div className="flex items-center text-emerald-400 font-semibold group-hover:translate-x-2 transition-transform">
                View analytics
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Resumes Uploaded</p>
            {loading ? (
              <div className="h-9 w-16 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats?.resumes_uploaded || 0}</p>
            )}
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Interviews Completed</p>
            {loading ? (
              <div className="h-9 w-16 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats?.interviews_completed || 0}</p>
            )}
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Questions Practiced</p>
            {loading ? (
              <div className="h-9 w-16 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats?.questions_practiced || 0}</p>
            )}
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Average Score</p>
            {loading ? (
              <div className="h-9 w-16 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-white">
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
