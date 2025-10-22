'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

interface Resume {
  id: number;
  file_url: string;
  parsed_data: any;
  created_at: string;
}

export default function ResumesPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchResumes();
  }, [token, router]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await api.getResumes(token!);
      setResumes(data.resumes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) return;

    try {
      setUploading(true);
      setError('');
      await api.uploadResume(selectedFile, token);
      setSelectedFile(null);
      fetchResumes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await api.deleteResume(resumeId, token);
      fetchResumes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF File (Max 10MB)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {uploading ? 'Uploading...' : 'Upload & Parse'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resumes List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Your Resumes ({resumes.length})
            </h2>
          </div>

          {resumes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No resumes uploaded yet. Upload your first resume above!
            </div>
          ) : (
            <div className="divide-y">
              {resumes.map((resume) => (
                <div key={resume.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {resume.parsed_data?.name || 'Resume'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {resume.parsed_data?.email || 'No email'}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                      </p>

                      {/* Skills Preview */}
                      {resume.parsed_data?.technical_skills && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 font-medium mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {resume.parsed_data.technical_skills.languages?.slice(0, 5).map((skill: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {resume.parsed_data.technical_skills.languages?.length > 5 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{resume.parsed_data.technical_skills.languages.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <a
                        href={resume.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View PDF
                      </a>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="text-red-600 hover:underline text-sm"
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
    </div>
  );
}
