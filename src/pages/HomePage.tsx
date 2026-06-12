import { useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Lottie from "lottie-react";

const steps = [
  {
    icon: FileText,
    title: "이력서 & 채용공고 입력",
    description: "이력서와 지원할 채용공고를 입력하세요",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: MessageSquare,
    title: "AI 모의면접",
    description: "맞춤 질문으로 실전같은 면접 연습",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: BarChart3,
    title: "상세 피드백",
    description: "항목별 점수와 구체적인 개선 방향 제공",
    color: "bg-indigo-50 text-indigo-600",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center px-6 pt-16 pb-8">
        {/* Logo & Title */}
        <div className="animate-fade-in-up flex flex-col items-center mb-10">
          <div className="w-48 h-48 mb-2">
            <Lottie
              path="/lottie/home_main.json"
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
            인터뷰메이트
          </h1>
          <p className="text-slate-500 text-center text-sm leading-relaxed max-w-[280px]">
            이력서 + 채용공고를 넣으면
            <br />
            AI가 맞춤 면접 질문을 생성하고
            <br />
            채팅으로 모의면접을 진행해요
          </p>
        </div>

        {/* Steps */}
        <div className="w-full space-y-3 mb-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="animate-fade-in-up flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{ animationDelay: `${(idx + 1) * 150}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}
                >
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      STEP {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Social Proof */}
        <div className="animate-fade-in delay-700 text-center mb-4">
          <p className="text-xs text-slate-400">
            이미 <span className="font-semibold text-primary-600">1,247명</span>의 취준생이 사용했어요
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 p-5 bg-gradient-to-t from-white via-white to-white/0">
        <button
          id="start-interview-btn"
          onClick={() => navigate("/resume")}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-primary-600/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-[15px] hover:shadow-xl hover:shadow-primary-600/30 cursor-pointer"
        >
          모의면접 시작하기
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
