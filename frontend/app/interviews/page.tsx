'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';
import { SkeletonInterview } from '@/components/Skeleton';

interface Interview {
  id: number;
  resume_id: number;
  job_description: string;
  jd_analysis: unknown;
  status: string;
  overall_score: number | null;
  created_at: string;
  completed_at: string | null;
}

export default function InterviewsPage() {
  const router = useRouter();
  const { isReady, getToken } = useClerkAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  useEffect(() => {
    if (isReady) {
      fetchInterviews();
    }
  }, [isReady]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await api.getInterviews(token);
      setInterviews(data.interviews || []);
    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (interviewId: number) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;

    try {
      const token = await getToken();
      if (!token) return;
      await api.deleteInterview(interviewId, token);
      fetchInterviews();
    } catch (err: unknown) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'in_progress':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'completed':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  // Filter and sort interviews
  const filteredAndSortedInterviews = interviews
    .filter(interview => {
      // Status filter
      if (statusFilter !== 'all' && interview.status.toLowerCase() !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const jobTitle = interview.jd_analysis?.job_title?.toLowerCase() || '';
        const company = interview.jd_analysis?.company?.toLowerCase() || '';
        const description = interview.job_description.toLowerCase();

        return jobTitle.includes(query) ||
               company.includes(query) ||
               description.includes(query);
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'score-high':
          return (b.overall_score || 0) - (a.overall_score || 0);
        case 'score-low':
          return (a.overall_score || 0) - (b.overall_score || 0);
        default:
          return 0;
      }
    });

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
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          <div className="h-12 w-64 bg-white/10 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-white/10 rounded-lg mb-12 animate-pulse"></div>

          {/* Interviews List Skeleton */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
            <div className="divide-y divide-white/10">
              {[1, 2, 3].map((i) => (
                <SkeletonInterview key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
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
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              My Interviews
            </h1>
            <p className="text-xl text-gray-300">
              View and manage your interview sessions
            </p>
          </div>
          <button
            onClick={() => router.push('/interviews/new')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            + New Interview
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm mb-6">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        {interviews.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
            {/* Search Bar */}
            <div className="relative mb-4">
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by job title, company, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status Filters and Sort */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === 'all'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === 'completed'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="recent" className="bg-slate-800">Most Recent</option>
                  <option value="oldest" className="bg-slate-800">Oldest First</option>
                  <option value="score-high" className="bg-slate-800">Highest Score</option>
                  <option value="score-low" className="bg-slate-800">Lowest Score</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            {(searchQuery || statusFilter !== 'all') && (
              <div className="mt-4 text-sm text-gray-400">
                Showing {filteredAndSortedInterviews.length} of {interviews.length} interviews
              </div>
            )}
          </div>
        )}

        {/* Interviews List */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">
              {searchQuery || statusFilter !== 'all' ? 'Filtered Interviews' : 'All Interviews'} ({filteredAndSortedInterviews.length})
            </h2>
          </div>

          {interviews.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-400">No interviews yet.</p>
              <p className="text-gray-500 text-sm mt-2">Create your first interview to get started!</p>
              <button
                onClick={() => router.push('/interviews/new')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Create Interview
              </button>
            </div>
          ) : filteredAndSortedInterviews.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-400">No interviews match your filters.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredAndSortedInterviews.map((interview) => (
                <div key={interview.id} className="p-6 hover:bg-white/5 transition group">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {interview.jd_analysis?.job_title || 'Interview'}
                          </h3>
                          {interview.jd_analysis?.company && (
                            <p className="text-sm text-purple-300 font-medium mt-1">
                              {interview.jd_analysis.company}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 border text-xs font-semibold rounded-full ${getStatusBadge(interview.status)}`}>
                          {interview.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {interview.job_description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(interview.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {interview.overall_score !== null && interview.overall_score !== undefined && (
                          <span className="flex items-center gap-1 font-semibold text-blue-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Score: {interview.overall_score}/10
                          </span>
                        )}
                      </div>

                      {/* Skills Preview */}
                      {interview.jd_analysis?.required_skills && (
                        <div className="flex flex-wrap gap-2">
                          {interview.jd_analysis.required_skills.slice(0, 5).map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {interview.jd_analysis.required_skills.length > 5 && (
                            <span className="px-2 py-1 text-xs text-gray-400">
                              +{interview.jd_analysis.required_skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {interview.status.toLowerCase() === 'completed' ? (
                        <button
                          onClick={() => router.push(`/interviews/${interview.id}/results`)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition text-center"
                        >
                          View Results
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push(`/interviews/${interview.id}`)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition text-center"
                        >
                          View Details
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(interview.id)}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
