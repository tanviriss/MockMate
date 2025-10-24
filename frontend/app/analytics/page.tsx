'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';
import { SkeletonStats, SkeletonChart } from '@/components/Skeleton';

export default function AnalyticsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAnalytics();
  }, [token, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics(token!);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              <Logo />
            </div>
          </div>
        </nav>

        {/* Main Content Skeleton */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div className="h-12 w-64 bg-white/10 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-white/10 rounded-lg mb-12 animate-pulse"></div>

          {/* Stats Skeleton */}
          <SkeletonStats />

          {/* Charts Skeleton */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      </main>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-300 mb-4">{error || "Analytics not available"}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📊 Your Progress
          </h1>
          <p className="text-xl text-gray-300">
            Track your interview performance over time
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Total Interviews */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics.total_interviews}
            </div>
            <div className="text-sm text-gray-400">Total Interviews</div>
          </div>

          {/* Average Score */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics.average_score ? analytics.average_score.toFixed(1) : 'N/A'}
              <span className="text-lg text-gray-400">/10</span>
            </div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>

          {/* Improvement */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics.improvement_rate !== null && analytics.improvement_rate !== undefined
                ? (analytics.improvement_rate > 0 ? '+' : '') + analytics.improvement_rate.toFixed(1) + '%'
                : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Improvement Rate</div>
          </div>

          {/* Best Category */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1 truncate">
              {analytics.best_category || 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Best Category</div>
          </div>
        </div>

        {/* Score Over Time Chart */}
        {analytics.score_history && analytics.score_history.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Score Progress</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.score_history.map((item: any, idx: number) => {
                const height = (item.score / 10) * 100;
                const color = item.score >= 8 ? 'bg-green-500' : item.score >= 6 ? 'bg-yellow-500' : 'bg-red-500';

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-slate-700/50 rounded-t-lg relative group" style={{ height: `${height}%`, minHeight: '20px' }}>
                      <div className={`absolute inset-0 ${color} rounded-t-lg opacity-75 hover:opacity-100 transition`}></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-slate-800 px-2 py-1 rounded text-sm text-white whitespace-nowrap">
                        {item.score.toFixed(1)}/10
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Performance */}
        {analytics.category_performance && analytics.category_performance.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Category Performance</h2>
            <div className="space-y-4">
              {analytics.category_performance.map((cat: any, idx: number) => {
                const percentage = (cat.average_score / 10) * 100;
                const color = cat.average_score >= 8 ? 'bg-green-500' : cat.average_score >= 6 ? 'bg-yellow-500' : 'bg-red-500';

                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{cat.category}</span>
                      <span className="text-gray-300">{cat.average_score.toFixed(1)}/10</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{cat.count} question{cat.count > 1 ? 's' : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {analytics.insights && analytics.insights.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">💡 AI Insights</h2>
            <div className="space-y-4">
              {analytics.insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-200">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {analytics.total_interviews === 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Analytics Yet</h2>
            <p className="text-gray-300 mb-6">
              Complete some interviews to see your progress and insights here!
            </p>
            <button
              onClick={() => router.push('/interviews/new')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Start Your First Interview
            </button>
          </div>
        )}
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
