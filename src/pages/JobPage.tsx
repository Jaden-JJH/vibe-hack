import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  Loader2,
  Building2,
  Briefcase,
  CheckCircle2,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import StepIndicator from "../components/StepIndicator";
import { dummyJobPosting } from "../data/dummy";
import { useInterviewStore } from "../store/interviewStore";

export default function JobPage() {
  const navigate = useNavigate();
  const setJobInput = useInterviewStore((s) => s.setJobInput);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    mainTasks: "",
    requirements: "",
    preferred: "",
  });

  const handleFetchUrl = () => {
    if (!url.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFetched(true);
      setFormData({
        company: dummyJobPosting.company,
        position: dummyJobPosting.position,
        mainTasks: dummyJobPosting.mainTasks,
        requirements: dummyJobPosting.requirements,
        preferred: dummyJobPosting.preferred,
      });
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStart = () => {
    setJobInput(formData);
    navigate("/loading");
  };

  const isReady =
    !!formData.company.trim() &&
    !!formData.position.trim() &&
    !!formData.mainTasks.trim();

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

      {/* Step Indicator */}
      <StepIndicator
        currentStep={2}
        totalSteps={3}
        labels={["이력서", "채용공고", "면접"]}
      />

      {/* Content */}
      <div className="flex-1 px-5 pb-28 overflow-y-auto">
        {/* URL Input */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <LinkIcon size={14} className="text-primary-500" />
            채용공고 URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/jobs/..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
            <button
              onClick={handleFetchUrl}
              disabled={loading || !url.trim()}
              className="px-4 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "불러오기"
              )}
            </button>
          </div>
        </div>

        {/* Fetched Job Posting Card */}
        {fetched && (
          <div className="animate-scale-in mb-6">
            <div className="p-5 bg-gradient-to-br from-primary-50 to-violet-50 rounded-2xl border border-primary-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Building2 size={24} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {formData.company}
                  </h3>
                  <p className="text-sm text-primary-600 font-medium">
                    {formData.position}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/70 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Briefcase size={13} className="text-primary-500" />
                    <span className="text-xs font-semibold text-primary-600">주요 업무</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{formData.mainTasks}</p>
                </div>

                <div className="bg-white/70 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 size={13} className="text-green-500" />
                    <span className="text-xs font-semibold text-green-600">자격요건</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{formData.requirements}</p>
                </div>

                <div className="bg-white/70 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Star size={13} className="text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600">우대사항</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{formData.preferred}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Input Toggle */}
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-4 cursor-pointer"
        >
          {showManual ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          직접 입력하기
        </button>

        {showManual && (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">회사명</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">직무</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange("position", e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">주요 업무</label>
              <textarea
                value={formData.mainTasks}
                onChange={(e) => handleChange("mainTasks", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">자격요건</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => handleChange("requirements", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">우대사항</label>
              <textarea
                value={formData.preferred}
                onChange={(e) => handleChange("preferred", e.target.value)}
                rows={2}
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
          disabled={!isReady}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-primary-600/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-[15px] hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          면접 시작
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
