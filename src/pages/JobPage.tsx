import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Link as LinkIcon, Loader2,
  Building2, Briefcase, CheckCircle2, Star, AlertCircle,
  ClipboardPaste, FileText,
} from "lucide-react";
import StepIndicator from "../components/StepIndicator";
import { useInterviewStore } from "../store/interviewStore";
import { fetchJobPostingFromUrl } from "../utils/jobPostingParser";
import { parseJobPosting } from "../services/claudeService";
import type { JobInput } from "../types";

type TabType = "url" | "paste" | "manual";

const emptyJob: JobInput = {
  company: "", position: "", mainTasks: "", requirements: "", preferred: "",
};

function JobPreviewCard({ job }: { job: JobInput }) {
  return (
    <div className="p-5 bg-gradient-to-br from-primary-50 to-violet-50 rounded-2xl border border-primary-100 animate-scale-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
          <Building2 size={24} className="text-primary-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">{job.company || "회사명 미확인"}</h3>
          <p className="text-sm text-primary-600 font-medium">{job.position || "직무 미확인"}</p>
        </div>
      </div>
      <div className="space-y-2">
        {job.mainTasks && (
          <div className="bg-white/70 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Briefcase size={12} className="text-primary-500" />
              <span className="text-xs font-semibold text-primary-600">주요 업무</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{job.mainTasks}</p>
          </div>
        )}
        {job.requirements && (
          <div className="bg-white/70 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={12} className="text-green-500" />
              <span className="text-xs font-semibold text-green-600">자격요건</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{job.requirements}</p>
          </div>
        )}
        {job.preferred && (
          <div className="bg-white/70 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={12} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-600">우대사항</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{job.preferred}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobPage() {
  const navigate = useNavigate();
  const setJobInput = useInterviewStore((s) => s.setJobInput);

  const [activeTab, setActiveTab] = useState<TabType>("url");
  const [url, setUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [formData, setFormData] = useState(emptyJob);
  const [parsedJob, setParsedJob] = useState<JobInput | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFetchUrl = async () => {
    if (!url.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    setParsedJob(null);

    const result = await fetchJobPostingFromUrl(url.trim());

    if (!result.success || !result.rawText) {
      setStatus("error");
      setErrorMsg(result.error ?? "URL을 불러오지 못했어요. 텍스트 붙여넣기 탭을 이용해 주세요.");
      return;
    }

    try {
      const structured = await parseJobPosting(result.rawText);
      setParsedJob(structured);
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg("공고 분석에 실패했어요. 텍스트 붙여넣기 탭을 이용해 주세요.");
    }
  };

  const handleAnalyzePaste = async () => {
    if (!pasteText.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    setParsedJob(null);

    try {
      const structured = await parseJobPosting(pasteText.trim());
      setParsedJob(structured);
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg("텍스트 분석에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setStatus("idle");
    setErrorMsg("");
    setParsedJob(null);
  };

  const handleStart = () => {
    if (activeTab === "manual") {
      setJobInput(formData);
    } else if (parsedJob) {
      setJobInput(parsedJob);
    }
    navigate("/loading");
  };

  const isReady =
    (activeTab === "manual" &&
      !!formData.company.trim() &&
      !!formData.position.trim() &&
      !!formData.mainTasks.trim()) ||
    ((activeTab === "url" || activeTab === "paste") &&
      parsedJob !== null &&
      !!parsedJob.position.trim());

  const tabs: { key: TabType; label: string; icon: typeof LinkIcon }[] = [
    { key: "url", label: "URL", icon: LinkIcon },
    { key: "paste", label: "텍스트", icon: ClipboardPaste },
    { key: "manual", label: "직접 입력", icon: FileText },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800">채용공고 입력</h2>
      </div>

      <StepIndicator currentStep={2} totalSteps={3} labels={["이력서", "채용공고", "면접"]} />

      <div className="flex-1 px-5 pb-28 overflow-y-auto">
        {/* 3-tab switcher */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6 gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === key ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* URL Tab */}
        {activeTab === "url" && (
          <div className="animate-fade-in space-y-4">
            <p className="text-xs text-slate-400">
              사람인, 원티드, 점핏, 잡플래닛 등의 채용공고 URL을 입력하세요.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                placeholder="https://www.saramin.co.kr/..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
              <button
                onClick={handleFetchUrl}
                disabled={status === "loading" || !url.trim()}
                className="px-4 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : "불러오기"}
              </button>
            </div>

            {status === "error" && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-red-600">{errorMsg}</p>
                  <button
                    onClick={() => handleTabChange("paste")}
                    className="text-xs text-primary-600 font-semibold mt-1.5 underline cursor-pointer"
                  >
                    텍스트 붙여넣기로 전환 →
                  </button>
                </div>
              </div>
            )}

            {status === "done" && parsedJob && <JobPreviewCard job={parsedJob} />}
          </div>
        )}

        {/* Paste Tab */}
        {activeTab === "paste" && (
          <div className="animate-fade-in space-y-4">
            <p className="text-xs text-slate-400">
              채용공고 페이지의 내용을 복사해서 아래에 붙여넣어 주세요.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder="채용공고 내용을 여기에 붙여넣어 주세요.&#10;&#10;회사명, 직무, 주요 업무, 자격요건, 우대사항 등을 포함하면 더 정확한 면접 질문이 생성됩니다."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
            />
            <button
              onClick={handleAnalyzePaste}
              disabled={status === "loading" || !pasteText.trim()}
              className="w-full py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {status === "loading" ? (
                <><Loader2 size={16} className="animate-spin" /> 분석 중...</>
              ) : (
                "AI로 분석하기"
              )}
            </button>

            {status === "error" && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
            )}

            {status === "done" && parsedJob && <JobPreviewCard job={parsedJob} />}
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === "manual" && (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">회사명</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                placeholder="토스"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">직무</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData((p) => ({ ...p, position: e.target.value }))}
                placeholder="프론트엔드 엔지니어"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">주요 업무</label>
              <textarea
                value={formData.mainTasks}
                onChange={(e) => setFormData((p) => ({ ...p, mainTasks: e.target.value }))}
                rows={3}
                placeholder="React 기반 웹 프로덕트 개발, 성능 최적화..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">자격요건</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData((p) => ({ ...p, requirements: e.target.value }))}
                rows={2}
                placeholder="React/TypeScript 실무 3년 이상..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">우대사항</label>
              <textarea
                value={formData.preferred}
                onChange={(e) => setFormData((p) => ({ ...p, preferred: e.target.value }))}
                rows={2}
                placeholder="Next.js SSR 경험, 테스트 코드 작성..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] p-5 bg-gradient-to-t from-white via-white to-white/0">
        <button
          id="job-start-btn"
          onClick={handleStart}
          disabled={!isReady || status === "loading"}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-primary-600/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-[15px] hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          면접 시작
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
