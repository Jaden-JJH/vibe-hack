import { create } from "zustand";
import type {
  ResumeInput,
  JobInput,
  InterviewQuestion,
  ChatMessage,
  ReportData,
} from "../types";

interface InterviewState {
  resumeInput: ResumeInput;
  jobInput: JobInput;
  questions: InterviewQuestion[];
  chatMessages: ChatMessage[];
  currentQuestionIndex: number;
  report: ReportData | null;
  isGenerating: boolean;
  isEvaluating: boolean;
  error: string | null;
}

interface InterviewActions {
  setResumeInput: (data: ResumeInput) => void;
  setJobInput: (data: JobInput) => void;
  setQuestions: (questions: InterviewQuestion[]) => void;
  addChatMessage: (role: ChatMessage["role"], content: string) => void;
  advanceQuestion: () => void;
  setReport: (report: ReportData) => void;
  setIsGenerating: (value: boolean) => void;
  setIsEvaluating: (value: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialResumeInput: ResumeInput = {
  name: "",
  position: "",
  experience: "",
  techStack: "",
  projects: "",
};

const initialJobInput: JobInput = {
  company: "",
  position: "",
  mainTasks: "",
  requirements: "",
  preferred: "",
};

const initialState: InterviewState = {
  resumeInput: initialResumeInput,
  jobInput: initialJobInput,
  questions: [],
  chatMessages: [],
  currentQuestionIndex: 0,
  report: null,
  isGenerating: false,
  isEvaluating: false,
  error: null,
};

export const useInterviewStore = create<InterviewState & InterviewActions>(
  (set) => ({
    ...initialState,

    setResumeInput: (data) => set({ resumeInput: data }),
    setJobInput: (data) => set({ jobInput: data }),
    setQuestions: (questions) => set({ questions }),
    addChatMessage: (role, content) =>
      set((state) => ({
        chatMessages: [
          ...state.chatMessages,
          { id: `${role}-${Date.now()}`, role, content },
        ],
      })),
    advanceQuestion: () =>
      set((state) => ({
        currentQuestionIndex: state.currentQuestionIndex + 1,
      })),
    setReport: (report) => set({ report }),
    setIsGenerating: (value) => set({ isGenerating: value }),
    setIsEvaluating: (value) => set({ isEvaluating: value }),
    setError: (error) => set({ error }),
    reset: () =>
      set({
        ...initialState,
        resumeInput: { ...initialResumeInput },
        jobInput: { ...initialJobInput },
      }),
  })
);
