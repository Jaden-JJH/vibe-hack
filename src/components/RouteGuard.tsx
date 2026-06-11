import { Navigate } from "react-router-dom";
import { useInterviewStore } from "../store/interviewStore";

export function ResumeGuard({ children }: { children: React.ReactNode }) {
  const name = useInterviewStore((s) => s.resumeInput.name);
  if (!name) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function JobGuard({ children }: { children: React.ReactNode }) {
  const name = useInterviewStore((s) => s.resumeInput.name);
  const jobPosition = useInterviewStore((s) => s.jobInput.position);
  const jobRaw = useInterviewStore((s) => s.jobInput.rawText);
  if (!name || (!jobPosition && !jobRaw)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function InterviewGuard({ children }: { children: React.ReactNode }) {
  const questions = useInterviewStore((s) => s.questions);
  if (questions.length === 0) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function ResultGuard({ children }: { children: React.ReactNode }) {
  const chatMessages = useInterviewStore((s) => s.chatMessages);
  if (chatMessages.length === 0) return <Navigate to="/" replace />;
  return <>{children}</>;
}
