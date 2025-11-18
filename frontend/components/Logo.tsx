export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Modern geometric icon with chat bubble + mic concept */}
        <div className="w-11 h-11 relative">
          {/* Background circle - solid color, no gradient */}
          <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-45 shadow-lg"></div>

          {/* Chat bubble shape */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              {/* Minimalist mic icon with chat elements */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12a4 4 0 108 0m0 0a4 4 0 10-8 0m4 4v4m-2 0h4"
              />
              <circle cx="12" cy="8" r="3" fill="currentColor" />
            </svg>
          </div>

          {/* Active indicator - small accent */}
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"></div>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-2xl font-bold text-white tracking-tight">
          Mock<span className="text-blue-400">Mate</span>
        </span>
      </div>
    </div>
  );
}
