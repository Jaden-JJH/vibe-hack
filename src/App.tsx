import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ResumePage from "./pages/ResumePage";
import JobPage from "./pages/JobPage";
import LoadingPage from "./pages/LoadingPage";
import InterviewPage from "./pages/InterviewPage";
import ResultPage from "./pages/ResultPage";
import { useInterviewStore } from "./store/interviewStore";
import { ResumeGuard, JobGuard, InterviewGuard, ResultGuard } from "./components/RouteGuard";
import { X } from "lucide-react";

export default function App() {
  const error = useInterviewStore((s) => s.error);
  const setError = useInterviewStore((s) => s.setError);

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-white relative shadow-2xl">
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[380px] z-50 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl shadow-md animate-fade-in">
            <span className="flex-1 leading-relaxed">{error} — 더미 데이터로 진행합니다.</span>
            <button onClick={() => setError(null)} className="shrink-0 text-red-400 hover:text-red-600 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/job" element={<ResumeGuard><JobPage /></ResumeGuard>} />
          <Route path="/loading" element={<JobGuard><LoadingPage /></JobGuard>} />
          <Route path="/interview" element={<InterviewGuard><InterviewPage /></InterviewGuard>} />
          <Route path="/result" element={<ResultGuard><ResultPage /></ResultGuard>} />
        </Routes>
      </div>
    </div>
  );
}
