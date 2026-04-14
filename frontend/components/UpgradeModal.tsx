'use client';

import { useState } from 'react';
import { useBilling } from '@/lib/useBilling';

type UpgradeReason = 'interview_limit' | 'company_prep' | 'resume_grill' | 'ideal_answer' | 'analytics' | 'more_questions';

interface UpgradeModalProps {
  reason: UpgradeReason;
  onClose?: () => void;
}

const REASON_CONTENT: Record<UpgradeReason, { title: string; description: string }> = {
  interview_limit: {
    title: "You've used all 2 free interviews",
    description: "Upgrade to Pro for unlimited interviews and keep your prep going before the real thing.",
  },
  company_prep: {
    title: "Company Prep is a Pro feature",
    description: "Get real interview questions sourced from Reddit, Glassdoor, and more for your target company.",
  },
  resume_grill: {
    title: "Resume Grill is a Pro feature",
    description: "Get grilled on every claim in your resume so no interviewer can catch you off guard.",
  },
  ideal_answer: {
    title: "Ideal Answers are a Pro feature",
    description: "See an example of a perfect answer for each question to know exactly what you should have said.",
  },
  analytics: {
    title: "Full Analytics is a Pro feature",
    description: "Track your improvement over time, see your weakest categories, and get AI-generated insights.",
  },
  more_questions: {
    title: "More questions require Pro",
    description: "Free plan supports up to 5 questions per interview. Upgrade to Pro for up to 15.",
  },
};

export default function UpgradeModal({ reason, onClose }: UpgradeModalProps) {
  const { upgrade } = useBilling();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const content = REASON_CONTENT[reason];

  const handleUpgrade = async () => {
    setLoading(true);
    await upgrade(billingCycle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        )}

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚡</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{content.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{content.description}</p>
        </div>

        {/* What's included */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6 space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Pro includes</p>
          {[
            'Unlimited interviews',
            'Up to 15 questions per interview',
            'Resume Grill',
            'Company Prep with real questions',
            'Ideal answer examples',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-green-500">✓</span>
              {feature}
            </div>
          ))}
        </div>

        {/* Billing toggle */}
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-4">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            $12/month
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            $8/mo <span className="text-xs opacity-75">($96/yr)</span>
          </button>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          {loading ? 'Redirecting...' : `Get unlimited practice before your interview →`}
        </button>

        <p className="text-center text-xs text-slate-400 mt-3">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
}
