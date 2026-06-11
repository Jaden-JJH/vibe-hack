import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileCheck, ArrowLeft, ArrowRight, User, Briefcase, Code, FolderOpen } from "lucide-react";
import StepIndicator from "../components/StepIndicator";
import { dummyResume } from "../data/dummy";
import { useInterviewStore } from "../store/interviewStore";

type TabType = "upload" | "manual";

export default function ResumePage() {
  const navigate = useNavigate();
  const setResumeInput = useInterviewStore((s) => s.setResumeInput);

  const [activeTab, setActiveTab] = useState<TabType>("manual");
  const [uploaded, setUploaded] = useState(false);

  const [formData, setFormData] = useState({
    name: dummyResume.name,
    position: dummyResume.position,
    experience: dummyResume.experienceSummary,
    techStack: dummyResume.techStack.join(", "),
    projects: dummyResume.projects.join("\n"),
  });

  const handleFileUpload = () => {
    setTimeout(() => {
      setUploaded(true);
      setFormData({
        name: dummyResume.name,
        position: dummyResume.position,
        experience: dummyResume.experienceSummary,
        techStack: dummyResume.techStack.join(", "),
        projects: dummyResume.projects.join("\n"),
      });
    }, 800);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isReady = formData.name.trim() && formData.position.trim();

  const handleNext = () => {
    setResumeInput(formData);
    navigate("/job");
  };

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
        <h2 className="text-lg font-bold text-slate-800">이력서 입력</h2>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={1}
        totalSteps={3}
        labels={["이력서", "채용공고", "면접"]}
      />

      {/* Content */}
      <div className="flex-1 px-5 pb-28 overflow-y-auto">
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "upload"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            PDF 업로드
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "manual"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            직접 입력
          </button>
        </div>

        {activeTab === "upload" ? (
          <div className="animate-fade-in">
            {!uploaded ? (
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <Upload size={28} className="text-primary-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    PDF 파일을 선택하세요
                  </p>
                  <p className="text-xs text-slate-400">
                    이력서 PDF를 업로드하면 자동으로 분석해요
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleFileUpload();
                  }}
                  className="mt-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  파일 선택하기
                </button>
              </label>
            ) : (
              <div className="animate-scale-in">
                <div className="flex items-center gap-3 p-5 bg-green-50 rounded-2xl border border-green-100">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <FileCheck size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      이력서를 불러왔어요 ✨
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {dummyResume.name}_이력서.pdf
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-2xl space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">분석 결과</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-600">{formData.name} · {formData.position}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Briefcase size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-600">{formData.experience}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Code size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-600">{formData.techStack}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <User size={14} className="text-primary-500" />
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <Briefcase size={14} className="text-primary-500" />
                희망 직무
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange("position", e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <FolderOpen size={14} className="text-primary-500" />
                경력 요약
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <Code size={14} className="text-primary-500" />
                기술 스택
              </label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => handleChange("techStack", e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                placeholder="쉼표로 구분"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <FolderOpen size={14} className="text-primary-500" />
                주요 프로젝트
              </label>
              <textarea
                value={formData.projects}
                onChange={(e) => handleChange("projects", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
                placeholder="한 줄에 하나씩"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] p-5 bg-gradient-to-t from-white via-white to-white/0">
        <button
          id="resume-next-btn"
          onClick={handleNext}
          disabled={!isReady}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-primary-600/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-[15px] hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
