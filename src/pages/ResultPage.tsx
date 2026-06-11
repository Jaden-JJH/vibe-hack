import { useNavigate } from "react-router-dom";
import {
  RotateCcw,
  ThumbsUp,
  AlertTriangle,
  MessageSquare,
  Trophy,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useInterviewStore } from "../store/interviewStore";
import { evaluateInterview } from "../services/claudeService";
import type { ReportData } from "../types";

function CircularGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = () => {
    if (score >= 85) return "#22c55e";
    if (score >= 70) return "#6366f1";
    return "#f59e0b";
  };

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={getColor()} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-800">{animatedScore}</span>
        <span className="text-xs text-slate-400 -mt-0.5">/ 100점</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color, delay }: { label: string; score: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold text-slate-700 w-8 text-right">{score}</span>
    </div>
  );
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { chatMessages, resumeInput, jobInput, report, setReport, setIsEvaluating, reset } =
    useInterviewStore();
  const calledRef = useRef(false);
  const [loading, setLoading] = useState(!report);

  useEffect(() => {
    if (report) {
      setLoading(false);
      return;
    }
    if (calledRef.current) return;
    calledRef.current = true;

    setIsEvaluating(true);
    setLoading(true);

    evaluateInterview(chatMessages, resumeInput, jobInput)
      .then((result: ReportData) => {
        setReport(result);
        setIsEvaluating(false);
        setLoading(false);
      })
      .catch(() => {
        setIsEvaluating(false);
        setLoading(false);
      });
  }, []);

  const handleRestart = () => {
    reset();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-8">
        <Loader2 size={40} className="text-primary-600 animate-spin" />
        <div className="text-center">
          <p className="text-base font-bold text-slate-800 mb-1">결과를 분석하고 있어요</p>
          <p className="text-sm text-slate-400">AI가 면접 내용을 종합 평가 중이에요...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-8">
        <p className="text-slate-500 text-sm">결과를 불러올 수 없어요.</p>
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold"
        >
          처음으로
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-6 pt-8 pb-10 text-center relative overflow-hidden">
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-white/5 rounded-full" />

        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy size={20} className="text-amber-300" />
          <h2 className="text-lg font-bold text-white">면접 결과 리포트</h2>
        </div>

        <div className="flex justify-center">
          <CircularGauge score={report.totalScore} />
        </div>

        <p className="text-primary-200 text-sm mt-2">종합 평가 점수</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 -mt-4 pb-28 space-y-5">
        {/* Category Scores */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-fade-in-up">
          <h3 className="text-sm font-bold text-slate-800 mb-4">항목별 점수</h3>
          <div className="space-y-3">
            {report.categories.map((cat, idx) => (
              <ScoreBar
                key={cat.label}
                label={cat.label}
                score={cat.score}
                color={cat.color}
                delay={400 + idx * 200}
              />
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-fade-in-up delay-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <ThumbsUp size={14} className="text-green-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">잘한 점</h3>
          </div>
          <ul className="space-y-2">
            {report.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 text-sm">✓</span>
                <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-fade-in-up delay-400">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">개선할 점</h3>
          </div>
          <ul className="space-y-2">
            {report.improvements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 text-sm">△</span>
                <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Per-question Feedback */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-fade-in-up delay-600">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
              <MessageSquare size={14} className="text-primary-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">질문별 피드백</h3>
          </div>
          <div className="space-y-3">
            {report.feedbacks.map((fb) => (
              <div key={fb.questionId} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs font-semibold text-primary-600 mb-1">
                  Q{fb.questionId}. {fb.question}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">{fb.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] p-5 bg-gradient-to-t from-white via-white to-white/0">
        <button
          id="restart-btn"
          onClick={handleRestart}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-primary-600/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-[15px] hover:shadow-xl cursor-pointer"
        >
          <RotateCcw size={18} />
          다시 면접 보기
        </button>
      </div>
    </div>
  );
}
