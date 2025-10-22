'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Logo from '@/components/Logo';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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
        <div className="grid md:grid-cols-3 gap-6">
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

          {/* Progress Card - Coming Soon */}
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 opacity-60">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">View Progress</h3>
              <p className="text-gray-400">
                Track your improvement and performance over time
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Placeholder for future */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Resumes Uploaded</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Interviews Completed</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Questions Practiced</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Average Score</p>
            <p className="text-3xl font-bold text-white">-</p>
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
