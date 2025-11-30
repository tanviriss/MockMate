"use client";

import { useState, useEffect } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

const INTERVIEW_MESSAGES = [
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
  "Counting your 'passionate' mentions...",
  "Questioning your GitHub gaps...",
  "Debating 'self-taught' vibes...",
  "Do you actually know those frameworks?...",
  "Calculating real salary expectations...",
  "Found that 3-month job you hid...",
  "Noticed 'Microsoft Office' as a skill...",
  "Spotting typos in 'detail-oriented'...",
  "Generating conflict scenarios...",
  "Predicting your sweat triggers...",
  "Writing 'why hire you' variations...",
  "Did you Google the company?...",
  "Preparing for your 'umm' pauses...",
  "Loading interviewer gotchas...",
  "Testing discomfort tolerance...",
  "What did you actually do though?...",
  "'Led a team' or just showed up?...",
  "Exposing skill level incoming...",
  "Does anyone know what 'agile' means?...",
  "What's a stakeholder anyway?...",
  "Creating impossible scenarios...",
  "Judging your career timeline...",
  "Raising eyebrows at job hopping...",
  "Preparing the salary negotiation trap...",
  "Writing questions with no right answer...",
  "Measuring your poker face ability...",
  "Testing if you read the job description...",
  "Checking for resume embellishments...",
  "Preparing the classic 'weakness' trap...",
];

const RESUME_GRILL_MESSAGES = [
  "Analyzing your resume...",
  "Extracting your claimed skills...",
  "Reading your job titles...",
  "Consulting the AI resume expert...",
  "Crafting questions about YOUR experience...",
  "Preparing to grill you properly...",
  "Scanning for buzzword density...",
  "Counting how many times you said 'responsible for'...",
  "Investigating vague accomplishments...",
  "Preparing follow-up questions...",
  "Creating scenario-based challenges...",
  "Testing if you actually did what you said...",
  "Generating 'tell me more about that' traps...",
  "Designing technical deep-dives...",
  "Planning behavioral callbacks...",
  "Cross-referencing your timeline...",
  "Spotting the leadership inflation...",
  "Questioning those 'team of 10' claims...",
  "Preparing for your project stories...",
  "Building context-specific scenarios...",
  "Wondering about that 6-month gap...",
  "Analyzing your skill progression...",
  "Creating challenges based on YOUR tech stack...",
  "Designing questions you can't google mid-interview...",
  "Testing depth vs breadth...",
  "Preparing 'explain it like I'm 5' moments...",
  "Generating metric validation questions...",
  "Challenging your impact claims...",
  "Building situational judgment tests...",
  "Crafting behavioral STAR setups...",
  "Preparing to test problem-solving...",
  "Creating role-specific scenarios...",
  "Designing conflict resolution questions...",
  "Planning priority/trade-off dilemmas...",
  "Testing your actual hands-on experience...",
  "Preparing stakeholder management questions...",
  "Generating technical architecture challenges...",
  "Building debugging scenario questions...",
  "Creating scale/performance scenarios...",
  "Testing your collaboration claims...",
  "Preparing 'walk me through' deep-dives...",
  "Designing mistake/failure explorations...",
  "Generating learning/growth questions...",
  "Building time-management scenarios...",
  "Creating decision-making challenges...",
  "Testing communication skills indirectly...",
  "Preparing open-ended exploration questions...",
  "Designing questions about your weaknesses...",
  "Building edge case scenarios...",
  "Creating system design challenges...",
  "Testing your mentorship claims...",
  "Preparing innovation/creativity tests...",
  "Generating adaptability scenarios...",
  "Building pressure-situation questions...",
  "Creating cross-functional work questions...",
  "Testing your ownership mentality...",
  "Almost ready to grill you...",
  "Final touches on the tough questions...",
  "Preparing the 'why did you leave' moment...",
  "Creating the closing challenge questions...",
  "Just a few more seconds...",
];

const RESUME_UPLOAD_MESSAGES = [
  "Uploading your PDF...",
  "Scanning document structure...",
  "Extracting text from resume...",
  "Parsing your work history...",
  "Reading your education section...",
  "Identifying your skills...",
  "Analyzing resume format...",
  "Decoding PDF layout...",
  "Extracting contact information...",
  "Processing job titles...",
  "Reading employment dates...",
  "Identifying certifications...",
  "Scanning for keywords...",
  "Analyzing bullet points...",
  "Extracting project descriptions...",
  "Processing achievements...",
  "Reading technical skills section...",
  "Identifying programming languages...",
  "Extracting company names...",
  "Analyzing experience timeline...",
  "Processing education credentials...",
  "Reading degree information...",
  "Scanning for publications...",
  "Extracting volunteer experience...",
  "Analyzing resume sections...",
  "Processing soft skills mentions...",
  "Reading leadership experience...",
  "Identifying team sizes managed...",
  "Extracting metrics and numbers...",
  "Processing impact statements...",
  "Analyzing action verbs...",
  "Reading technology stack...",
  "Identifying frameworks mentioned...",
  "Extracting tools and platforms...",
  "Processing industry experience...",
  "Reading domain expertise...",
  "Analyzing career progression...",
  "Identifying promotions...",
  "Extracting responsibilities...",
  "Processing achievements vs duties...",
  "Reading between the lines...",
  "Identifying gaps in timeline...",
  "Analyzing job-hopping patterns...",
  "Processing career trajectory...",
  "Reading salary indicators...",
  "Identifying seniority level...",
  "Extracting management experience...",
  "Processing technical depth...",
  "Analyzing breadth of skills...",
  "Identifying unique experiences...",
  "Structuring parsed data...",
  "Organizing information...",
  "Validating extracted content...",
  "Final processing...",
  "Almost done parsing...",
];

interface LoadingMessagesProps {
  interval?: number;
  type?: 'interview' | 'resume-grill' | 'resume-upload';
}

export default function LoadingMessages({ interval = 2000, type = 'interview' }: LoadingMessagesProps) {
  const messages = type === 'resume-grill'
    ? RESUME_GRILL_MESSAGES
    : type === 'resume-upload'
    ? RESUME_UPLOAD_MESSAGES
    : INTERVIEW_MESSAGES;

  const [messageIndex, setMessageIndex] = useState(Math.floor(Math.random() * messages.length));
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set([messageIndex]));

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex(() => {
        const availableIndices = messages
          .map((_, idx) => idx)
          .filter(idx => !usedIndices.has(idx));

        if (availableIndices.length === 0) {
          const newIndex = Math.floor(Math.random() * messages.length);
          setUsedIndices(new Set([newIndex]));
          return newIndex;
        }

        const newIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        setUsedIndices(prev => new Set([...prev, newIndex]));
        return newIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [interval, usedIndices, messages]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <div className="fixed inset-0 z-0 bg-slate-100 dark:bg-slate-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-200/50 dark:bg-slate-700/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-200/40 dark:bg-slate-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-md px-4">
        <div className="relative mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500 dark:bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-full border-4 border-transparent bg-blue-500 dark:bg-blue-400 animate-spin" style={{ animationDuration: "3s" }}>
              <div className="absolute inset-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-blue-500 dark:bg-blue-400 rounded-full opacity-20 animate-ping" style={{ animationDuration: "2s" }}></div>
          </div>
        </div>

        <LiquidButton className="mb-6 w-full min-h-[80px] px-6" size="xl">
          <p className="text-white text-lg font-medium transition-opacity duration-300 px-4 py-3 break-words text-center leading-relaxed" key={messageIndex}>
            {messages[messageIndex]}
          </p>
        </LiquidButton>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-500/50"></div>
          <div className="w-3 h-3 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-500/50" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce shadow-lg shadow-indigo-500/50" style={{ animationDelay: "0.2s" }}></div>
        </div>

        <div className="relative h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500 dark:bg-blue-400 rounded-lg blur-lg opacity-10"></div>
          <p className="relative text-slate-600 dark:text-slate-400 text-sm backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap">
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
