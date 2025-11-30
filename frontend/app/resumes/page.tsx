'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';
import Modal from '@/components/Modal';
import { SkeletonResume } from '@/components/Skeleton';
import LoadingMessages from '@/components/LoadingMessages';
interface Resume {
  id: number;
  file_url: string;
  parsed_data: {
    name?: string;
    email?: string;
    technical_skills?: string[];
    languages?: string[];
    [key: string]: unknown;
  };
  created_at: string;
}

export default function ResumesPage() {
  const router = useRouter();
  const { isReady, getToken } = useClerkAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showCancel: true,
  });

  useEffect(() => {
    if (!isReady) return;
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const data = await api.getResumes(token);
      setResumes(data.resumes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');
      const token = await getToken();
      if (!token) return;

      await api.uploadResume(selectedFile, token);
      setSelectedFile(null);
      fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId: number) => {
    setModalState({
      isOpen: true,
      type: 'warning',
      title: 'Delete Resume',
      message: 'Are you sure you want to delete this resume?\n\nWARNING: This will also delete all interviews created with this resume.',
      showCancel: true,
      onConfirm: async () => {
        try {
          const token = await getToken();
          if (!token) return;

          const result = await api.deleteResume(resumeId, token);

          // Show success message
          setModalState({
            isOpen: true,
            type: 'success',
            title: 'Resume Deleted',
            message: result.deleted_interviews > 0
              ? `Resume deleted successfully.\n\n${result.deleted_interviews} associated interview(s) were also deleted.`
              : 'Resume deleted successfully.',
            showCancel: false,
          });

          fetchResumes();
        } catch (err) {
          setModalState({
            isOpen: true,
            type: 'error',
            title: 'Delete Failed',
            message: err instanceof Error ? err.message : 'Failed to delete resume. Please try again.',
            showCancel: false,
          });
        }
      },
    });
  };

  if (uploading) {
    return <LoadingMessages interval={1500} />;
  }

  if (loading) {
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
            </div>
          </div>
        </nav>

        {/* Main Content Skeleton */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          <div className="h-12 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-slate-200 dark:bg-slate-700 rounded-lg mb-12 animate-pulse"></div>

          {/* Upload Section Skeleton */}
          <div className="bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-8 mb-8">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6 animate-pulse"></div>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12">
              <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Resumes List Skeleton */}
          <div className="bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {[1, 2, 3].map((i) => (
                <SkeletonResume key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
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
            <button onClick={() => router.push('/dashboard')}>
              <Logo />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-2"
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
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          My Resumes
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
          Upload and manage your resumes with AI-powered parsing
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm mb-6">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Upload New Resume</h2>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
          >
            {!selectedFile ? (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-slate-900 dark:text-white text-lg font-semibold mb-2">
                  Drop your resume here or click to browse
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  PDF only, max 10MB
                </p>
                <label className="cursor-pointer">
                  <span className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition inline-block">
                    Choose File
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 dark:bg-blue-400 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-slate-900 dark:text-white font-medium">{selectedFile.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumes List */}
        <div className="bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Your Resumes ({resumes.length})
            </h2>
          </div>

          {resumes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400">No resumes uploaded yet.</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Upload your first resume above!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {resumes.map((resume) => (
                <div key={resume.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-500 dark:bg-blue-400 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {resume.parsed_data?.name || 'Resume'}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                        {resume.parsed_data?.email || 'No email'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                        Uploaded: {new Date(resume.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>

                      {/* Skills Preview */}
                      {resume.parsed_data?.technical_skills && Array.isArray(resume.parsed_data.technical_skills) && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Top Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {resume.parsed_data.technical_skills.slice(0, 6).map((skill: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {resume.parsed_data.technical_skills.length > 6 && (
                              <span className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
                                +{resume.parsed_data.technical_skills.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <a
                        href={resume.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition text-center"
                      >
                        View PDF
                      </a>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition"
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

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        showCancel={modalState.showCancel}
      />

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
