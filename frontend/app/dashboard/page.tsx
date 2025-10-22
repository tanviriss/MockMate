'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

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
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Mock<span className="text-blue-600">Mate</span>
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user.full_name || user.email}!
          </h2>
          <p className="text-gray-600 mb-6">
            Your dashboard is ready. We'll build interview features here soon!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/resumes')}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition text-left"
            >
              <h3 className="font-semibold text-gray-900 mb-2">My Resumes</h3>
              <p className="text-sm text-gray-600">Upload and manage your resumes</p>
            </button>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Practice Interview</h3>
              <p className="text-sm text-gray-600">Coming soon...</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">View Progress</h3>
              <p className="text-sm text-gray-600">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
