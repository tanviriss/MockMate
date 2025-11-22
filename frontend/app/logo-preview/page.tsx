'use client';

import {
  LogoInfinity,
  LogoWaveform,
  LogoQuote,
  LogoPlay,
  LogoBrain,
  LogoTarget,
  LogoHex
} from '@/components/LogoOptions';

export default function LogoPreview() {
  const logos = [
    { name: 'Infinity Loop', component: LogoInfinity, description: 'Continuous practice & improvement' },
    { name: 'Waveform', component: LogoWaveform, description: 'Voice & audio visualization' },
    { name: 'Quote Bubble', component: LogoQuote, description: 'Interview conversation' },
    { name: 'Play Button', component: LogoPlay, description: 'Practice & replay' },
    { name: 'AI Brain', component: LogoBrain, description: 'AI-powered coaching' },
    { name: 'Target', component: LogoTarget, description: 'Hit your interview goals' },
    { name: 'Hexagon', component: LogoHex, description: 'Modern tech aesthetic' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4 text-center">
          Reherse Logo Options
        </h1>
        <p className="text-gray-400 text-center mb-12">
          Click on a design to copy the component name
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {logos.map((logo) => {
            const LogoComponent = logo.component;
            return (
              <button
                key={logo.name}
                onClick={() => {
                  navigator.clipboard.writeText(logo.component.name);
                  alert(`Copied "${logo.component.name}" to clipboard!`);
                }}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300"></div>

                {/* Logo display */}
                <div className="relative flex flex-col items-center gap-6">
                  <div className="scale-150">
                    <LogoComponent className="text-white" />
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">{logo.name}</h3>
                    <p className="text-sm text-gray-400">{logo.description}</p>
                  </div>

                  <div className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to copy component name
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">How to use:</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">1.</span>
              <span>Pick your favorite logo design from above</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">2.</span>
              <span>Open <code className="bg-white/10 px-2 py-1 rounded text-blue-400">frontend/components/Logo.tsx</code></span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">3.</span>
              <span>Replace the current export with your chosen component from <code className="bg-white/10 px-2 py-1 rounded text-blue-400">LogoOptions.tsx</code></span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">4.</span>
              <span>Example: <code className="bg-white/10 px-2 py-1 rounded text-purple-400">export default LogoWaveform</code></span>
            </li>
          </ol>
        </div>

        {/* Dark and light background previews */}
        <div className="mt-16 grid grid-cols-2 gap-8">
          <div className="bg-slate-950 border border-white/10 rounded-2xl p-8">
            <p className="text-gray-400 text-sm mb-6 text-center">Dark Background</p>
            <div className="flex flex-col gap-6 items-center">
              {logos.slice(0, 3).map((logo) => {
                const LogoComponent = logo.component;
                return (
                  <LogoComponent key={logo.name} className="text-white" />
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-600 text-sm mb-6 text-center">Light Background</p>
            <div className="flex flex-col gap-6 items-center">
              {logos.slice(0, 3).map((logo) => {
                const LogoComponent = logo.component;
                return (
                  <LogoComponent key={logo.name} className="text-gray-900" />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
