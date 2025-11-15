"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import AudioRecorder from "@/components/AudioRecorder";
import VideoFeed from "@/components/VideoFeed";
import InterviewerAvatar from "@/components/InterviewerAvatar";
import { useInterview } from "@/lib/useInterview";

export default function LiveInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const interviewId = parseInt(resolvedParams.id);
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [hasStarted, setHasStarted] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [token, setToken] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get token when auth is ready
  useEffect(() => {
    const fetchToken = async () => {
      if (isSignedIn) {
        const tkn = await getToken();
        if (tkn) setToken(tkn);
      }
    };
    fetchToken();
  }, [isSignedIn, getToken]);

  const {
    isConnected,
    isStarted,
    isCompleted,
    currentQuestion,
    questionAudio,
    transcript,
    error,
    isTranscribing,
    totalQuestions,
    currentQuestionNumber,
    startInterview,
    submitAnswer,
    confirmAnswer,
    endInterview,
    resetTranscript,
  } = useInterview(interviewId, user?.id || "", token);

  // Update edited transcript when new transcript arrives
  useEffect(() => {
    if (transcript) {
      setEditedTranscript(transcript);
    }
  }, [transcript]);

  // Auto-play question audio in background
  useEffect(() => {
    if (questionAudio) {
      // Convert base64 to blob
      const byteCharacters = atob(questionAudio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      // Create and play audio
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setIsAudioPlaying(true);
      audio.onended = () => setIsAudioPlaying(false);
      audio.onpause = () => setIsAudioPlaying(false);

      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setIsAudioPlaying(false);
      });

      return () => {
        audio.pause();
        URL.revokeObjectURL(url);
        setIsAudioPlaying(false);
      };
    }
  }, [questionAudio]);

  // Redirect if completed
  useEffect(() => {
    if (isCompleted) {
      setTimeout(() => {
        router.push(`/interviews/${interviewId}/results`);
      }, 3000);
    }
  }, [isCompleted, interviewId, router]);

  // Handle start interview
  const handleStart = () => {
    setHasStarted(true);
    startInterview();
  };

  // Handle recording complete
  const handleRecordingComplete = (audioBlob: Blob) => {
    submitAnswer(audioBlob);
  };

  // Handle confirm and next
  const handleConfirmAndNext = () => {
    confirmAnswer(editedTranscript);
    setEditedTranscript("");
  };

  // Handle end early
  const handleEndEarly = () => {
    if (confirm("Are you sure you want to end the interview early?")) {
      endInterview();
    }
  };

  // Determine interviewer avatar state
  const getAvatarState = (): 'idle' | 'talking' | 'listening' => {
    if (isRecording) return 'listening';
    if (isAudioPlaying) return 'talking';
    return 'idle';
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Live Interview
              </h1>
              {isConnected && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Connected
                </div>
              )}
              {!isConnected && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  Disconnected
                </div>
              )}
            </div>

            {isStarted && (
              <div className="text-right">
                <div className="text-4xl font-bold text-white">
                  {currentQuestionNumber}/{totalQuestions}
                </div>
                <div className="text-sm text-gray-400">Questions</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isStarted && (
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8 text-red-200">
            {error}
          </div>
        )}

        {/* Start Screen */}
        {!hasStarted && !isCompleted && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <div className="text-6xl mb-6">🎤</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start?
            </h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Make sure you&apos;re in a quiet environment with a working microphone.
              You&apos;ll be asked {totalQuestions || 10} questions.
            </p>
            <button
              onClick={handleStart}
              disabled={!isConnected}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105"
            >
              {isConnected ? "Start Interview" : "Connecting..."}
            </button>
          </div>
        )}

        {/* Interview In Progress */}
        {isStarted && currentQuestion && !isCompleted && (
          <div className="space-y-8">
            {/* Interviewer Avatar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <InterviewerAvatar
                state={getAvatarState()}
                audioPlaying={isAudioPlaying}
              />
            </div>

            {/* Question Display */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {currentQuestionNumber}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {currentQuestion.question_text}
                  </h2>
                  {isAudioPlaying && (
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <span>Interviewer is speaking...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recording Section */}
            {!transcript && !isTranscribing && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6 text-center">
                  Record Your Answer
                </h3>
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  maxDuration={300}
                  onRecordingStateChange={setIsRecording}
                />
              </div>
            )}

            {/* Transcribing State */}
            {isTranscribing && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Transcribing...
                </h3>
                <p className="text-gray-400">
                  Please wait while we transcribe your answer
                </p>
              </div>
            )}

            {/* Transcript Review */}
            {transcript && !isTranscribing && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Review Your Answer
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  You can edit your transcript if needed
                </p>

                <textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="w-full h-40 bg-slate-800/50 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setEditedTranscript("");
                      resetTranscript();
                    }}
                    className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Re-record
                  </button>
                  <button
                    onClick={handleConfirmAndNext}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    Confirm & Next Question
                  </button>
                </div>
              </div>
            )}

            {/* End Interview Button */}
            <div className="text-center">
              <button
                onClick={handleEndEarly}
                className="text-red-400 hover:text-red-300 text-sm underline"
              >
                End Interview Early
              </button>
            </div>
          </div>
        )}

        {/* Completion Screen */}
        {isCompleted && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Interview Complete!
            </h2>
            <p className="text-gray-300 mb-8">
              Great job! We&apos;re processing your responses and generating feedback.
              You&apos;ll be redirected to the results page shortly.
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* User Video Feed */}
      {isStarted && !isCompleted && <VideoFeed isVisible={true} />}
    </div>
  );
}
