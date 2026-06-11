import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useInterviewStore } from "../store/interviewStore";
import { generateQuestions } from "../services/claudeService";

export default function LoadingPage() {
  const navigate = useNavigate();
  const { resumeInput, jobInput, setQuestions, setIsGenerating, setError } =
    useInterviewStore();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    setIsGenerating(true);

    generateQuestions(resumeInput, jobInput)
      .then((questions) => {
        setQuestions(questions);
        setIsGenerating(false);
        navigate("/interview", { replace: true });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "질문 생성에 실패했어요");
        setIsGenerating(false);
        navigate("/interview", { replace: true });
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8">
      {/* Loading animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-primary-100" />
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-primary-600 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={28} className="text-primary-600 animate-pulse-soft" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center animate-fade-in">
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          AI가 맞춤 면접 질문을
          <br />
          생성하고 있어요
        </h2>
        <p className="text-sm text-slate-400">
          이력서와 채용공고를 분석하는 중이에요...
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-8">
        <div className="w-2 h-2 rounded-full bg-primary-600 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-primary-600 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-primary-600 typing-dot" />
      </div>
    </div>
  );
}
