import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Question {
  question_id: number;
  question_text: string;
  question_number: number;
  total_questions: number;
  context: unknown;
}

interface InterviewState {
  isConnected: boolean;
  isStarted: boolean;
  isCompleted: boolean;
  currentQuestion: Question | null;
  questionAudio: string | null;
  transcript: string | null;
  error: string | null;
  isTranscribing: boolean;
  totalQuestions: number;
  currentQuestionNumber: number;
}

export function useInterview(interviewId: number, userId: string, token: string) {
  const [state, setState] = useState<InterviewState>({
    isConnected: false,
    isStarted: false,
    isCompleted: false,
    currentQuestion: null,
    questionAudio: null,
    transcript: null,
    error: null,
    isTranscribing: false,
    totalQuestions: 0,
    currentQuestionNumber: 0,
  });

  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token || !userId) {
      console.log("Waiting for token and userId...");
      return;
    }

    const WS_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const socket = io(WS_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      setState((prev) => {
        if (prev.isStarted && !prev.isCompleted) {
          console.log("Reconnected during interview, restarting interview session");
          socket.emit("start_interview", {
            interview_id: interviewId,
            user_id: userId,
          });
        }
        return { ...prev, isConnected: true, error: null };
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
      setState((prev) => ({ ...prev, isConnected: false }));
    });

    socket.on("connected", (data) => {
      console.log("Session connected:", data.sid);
    });

    // Interview event handlers
    socket.on("interview_started", (data) => {
      console.log("Interview started:", data);
      setState((prev) => ({
        ...prev,
        isStarted: true,
        totalQuestions: data.total_questions,
        currentQuestionNumber: 1,
      }));
    });

    socket.on("question", (data: Question) => {
      console.log("Received question:", data);
      setState((prev) => ({
        ...prev,
        currentQuestion: data,
        currentQuestionNumber: data.question_number,
        questionAudio: null,
        transcript: null,
      }));
    });

    socket.on("question_audio", (data) => {
      console.log("Received question audio");
      setState((prev) => ({
        ...prev,
        questionAudio: data.audio_data,
      }));
    });

    socket.on("transcribing", () => {
      console.log("Transcribing...");
      setState((prev) => ({
        ...prev,
        isTranscribing: true,
      }));
    });

    socket.on("transcript_ready", (data) => {
      console.log("Transcript ready:", data.transcript);
      setState((prev) => ({
        ...prev,
        transcript: data.transcript,
        isTranscribing: false,
      }));
    });

    socket.on("followup_question", (data) => {
      console.log("Received follow-up question:", data);
      const cleanFollowupText = data.followup_text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .trim();

      setState((prev) => ({
        ...prev,
        currentQuestion: {
          ...prev.currentQuestion!,
          question_text: cleanFollowupText,
        },
        questionAudio: null,
        transcript: null,
      }));
    });

    socket.on("interview_completed", (data) => {
      console.log("Interview completed:", data);
      setState((prev) => ({
        ...prev,
        isCompleted: true,
        isStarted: false,
      }));
    });

    socket.on("error", (data) => {
      console.error("Interview error:", data.message);
      setState((prev) => ({
        ...prev,
        error: data.message,
        isTranscribing: false,
      }));
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, userId, interviewId]);

  // Start interview
  const startInterview = useCallback(() => {
    if (socketRef.current && state.isConnected) {
      socketRef.current.emit("start_interview", {
        interview_id: interviewId,
        user_id: userId,
      });
    }
  }, [interviewId, userId, state.isConnected]);

  // Submit answer audio
  const submitAnswer = useCallback(
    (audioBlob: Blob) => {
      if (!socketRef.current || !state.currentQuestion) return;

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove the data:audio/webm;base64, prefix
        const base64Audio = base64data.split(",")[1];

        socketRef.current!.emit("submit_answer", {
          question_id: state.currentQuestion!.question_id,
          audio_data: base64Audio,
          format: "webm",
        });
      };
    },
    [state.currentQuestion]
  );

  // Confirm answer and move to next question
  const confirmAnswer = useCallback(
    (transcript: string) => {
      if (!socketRef.current || !state.currentQuestion) return;

      socketRef.current.emit("confirm_answer", {
        question_id: state.currentQuestion.question_id,
        transcript: transcript,
      });

      // Reset transcript for next question
      setState((prev) => ({
        ...prev,
        transcript: null,
      }));
    },
    [state.currentQuestion]
  );

  // End interview early
  const endInterview = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("end_interview", {});
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: null,
    }));
  }, []);

  return {
    ...state,
    startInterview,
    submitAnswer,
    confirmAnswer,
    endInterview,
    resetTranscript,
  };
}
