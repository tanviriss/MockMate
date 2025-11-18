export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative">
        {/* Rounded square background with subtle border */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md border border-blue-500/30">
          {/* Modern minimalist microphone icon */}
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.2}
          >
            {/* Simplified mic shape */}
            <rect x="9" y="3" width="6" height="10" rx="3" fill="currentColor" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 10v2a7 7 0 0014 0v-2M12 19v4m-4 0h8"
            />
          </svg>
        </div>
        {/* Active status indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
      </div>
      <span className="text-2xl font-bold text-white">
        MockMate
      </span>
    </div>
  );
}
