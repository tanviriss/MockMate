"use client";

import { useState, useEffect } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

const LOADING_MESSAGES = [
  "Analyzing job description...",
  "Extracting key requirements...",
  "Matching skills with your resume...",
  "Consulting the AI brain...",
  "Crafting the perfect questions...",
  "Thinking really hard...",
  "Pinagoogling through databases...",
  "Summoning interview wisdom...",
  "Brewing some technical questions...",
  "Reading between the lines...",
  "Calculating difficulty levels...",
  "Mixing behavioral questions...",
  "Sprinkling some STAR method magic...",
  "Channeling inner recruiter energy...",
  "Decoding corporate buzzwords...",
  "Translating 'synergy' into real questions...",
  "Teaching AI what 'culture fit' means...",
  "Finding needles in resume haystacks...",
  "Asking the magic 8-ball...",
  "Reverse engineering interview patterns...",
  "Stealing questions from FAANG interviews...",
  "Pretending to be a hiring manager...",
  "Judging your LinkedIn profile...",
  "Making it sound professional...",
  "Adding that special sauce...",
  "Consulting with imaginary HR...",
  "Overthinking this a bit...",
  "Almost done, promise...",
  "Just a few more seconds...",
  "Putting on the final polish...",
  "Convincing the AI this matters...",
  "Checking if you can handle this...",
  "Generating questions you'll definitely bomb...",
  "Making sure these aren't too easy...",
  "Or too hard... finding balance...",
  "Predicting your nervous laughs...",
  "Writing down 'tell me about yourself'...",
  "Debating if LeetCode counts as experience...",
  "Wondering why you put '5 years React' for 2 years...",
  "Reading your 'passion for coding' claim...",
  "Fact-checking your project descriptions...",
  "Preparing 'where do you see yourself' variations...",
  "Making it interview-realistic...",
  "Avoiding cliché questions (mostly)...",
  "Throwing in a curveball or two...",
  "Balancing soft skills with hard truths...",
  "Adding questions about your gaps in employment...",
  "Preparing for your 'I'm a perfectionist' answer...",
  "Simulating awkward silence moments...",
  "Writing 'any questions for us?' prep...",
  "Channeling every interviewer ever...",
  "Remembering what 'team player' means...",
  "Researching what companies actually want...",
  "Ignoring your typos (for now)...",
  "Pretending years of experience matter...",
  "Calculating if you're overqualified...",
  "Or underqualified... hmm...",
  "Checking if 'fast learner' is still acceptable...",
  "Validating your tech stack claims...",
  "Cross-referencing with actual job needs...",
  "Adding the mandatory 'weakness' question...",
  "Spicing things up with scenarios...",
  "Making sure it's not too corporate-y...",
  "But also not too casual...",
  "Balancing the vibes...",
  "Testing your BS detector...",
  "Preparing to catch buzzword overload...",
  "Making this worth your time...",
  "Hopefully...",
  "Trust the process...",
  "AI is doing its thing...",
  "Beep boop generating questions beep boop...",
];

interface LoadingMessagesProps {
  interval?: number;
}

export default function LoadingMessages({ interval = 2000 }: LoadingMessagesProps) {
  const [messageIndex, setMessageIndex] = useState(Math.floor(Math.random() * LOADING_MESSAGES.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-md px-4">
        <div className="relative mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin" style={{ animationDuration: "3s" }}>
              <div className="absolute inset-1 bg-slate-900 rounded-full"></div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20 animate-ping" style={{ animationDuration: "2s" }}></div>
          </div>
        </div>

        <LiquidButton className="mb-6 w-full min-h-[60px]" size="xl">
          <p className="text-white text-lg font-medium transition-opacity duration-300" key={messageIndex}>
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </LiquidButton>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50"></div>
          <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full animate-bounce shadow-lg shadow-pink-500/50" style={{ animationDelay: "0.2s" }}></div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-lg opacity-20"></div>
          <p className="relative text-gray-300 text-sm backdrop-blur-sm bg-white/5 py-2 px-4 rounded-lg border border-white/10">
            This usually takes 10-20 seconds
          </p>
        </div>
      </div>

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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
