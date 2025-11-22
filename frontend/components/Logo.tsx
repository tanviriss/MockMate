export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group">
        <div className="relative w-12 h-12">
          {/* Pulsing glow */}
          <div className="absolute inset-0 bg-purple-500/30 rounded-2xl blur-md animate-pulse"></div>

          {/* Main container - solid purple instead of gradient */}
          <div className="absolute inset-0 bg-purple-600 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-lg shadow-purple-500/40">
            <svg
              className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              {/* Brain/AI neural network icon */}
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/>
              <circle cx="7" cy="7" r="2"/>
              <circle cx="17" cy="7" r="2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
              <line x1="9" y1="8" x2="11" y2="10" strokeLinecap="round"/>
              <line x1="15" y1="8" x2="13" y2="10" strokeLinecap="round"/>
              <line x1="9" y1="16" x2="11" y2="14" strokeLinecap="round"/>
              <line x1="15" y1="16" x2="13" y2="14" strokeLinecap="round"/>
            </svg>
          </div>

        </div>
      </div>
      <span className="text-2xl font-bold text-white tracking-tight">
        Reherse
      </span>
    </div>
  );
}
