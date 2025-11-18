export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 bg-violet-500/30 rounded-full animate-pulse"></div>

          <div className="absolute inset-1 bg-violet-600/50 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>

          <div className="absolute inset-2 bg-violet-600 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <svg
              className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>

          {/* Active indicator - pulse animation */}
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        MockMate
      </span>
    </div>
  );
}
