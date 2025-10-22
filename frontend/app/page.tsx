'use client';

import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Logo className="text-white" />
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 text-white hover:text-blue-400 transition font-medium"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl space-y-8 animate-fade-in">
          <div className="inline-block">
            <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-semibold backdrop-blur-sm">
              AI-Powered Interview Coaching
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
            Ace Your Next
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Job Interview
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Practice with AI-generated questions tailored to your resume and job description.
            Get real-time voice feedback and track your progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={() => router.push('/signup')}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              Start Practicing Free
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div id="features" className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24">
          <div className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition hover:scale-105 transform">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Resume Analysis</h3>
            <p className="text-gray-400">
              Upload your resume and get AI-powered analysis of your skills and experience
            </p>
          </div>

          <div className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition hover:scale-105 transform">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Voice Practice</h3>
            <p className="text-gray-400">
              Practice interviews with real-time voice interaction and natural conversations
            </p>
          </div>

          <div className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition hover:scale-105 transform">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Feedback</h3>
            <p className="text-gray-400">
              Get detailed AI feedback on your answers and track improvement over time
            </p>
          </div>
        </div>
      </div>

      {/* Add custom animations to globals.css */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </main>
  );
}
