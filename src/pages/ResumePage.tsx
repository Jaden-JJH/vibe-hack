import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, FileCheck, ArrowLeft, ArrowRight,
  User, Briefcase, Code, FolderOpen, Loader2, AlertCircle,
} from "lucide-react";
import Lottie from "lottie-react";
import StepIndicator from "../components/StepIndicator";
import { useInterviewStore } from "../store/interviewStore";
import { extractTextFromPdf } from "../utils/pdfParser";
import { parseResume } from "../services/claudeService";

type TabType = "upload" | "manual";

const emptyForm = { name: "", position: "", experience: "", techStack: "", projects: "" };

export default function ResumePage() {
  const navigate = useNavigate();
  const setResumeInput = useInterviewStore((s) => s.setResumeInput);

  const [activeTab, setActiveTab] = useState<TabType>("manual");
  const [formData, setFormData] = useState(emptyForm);
  const [pdfStatus, setPdfStatus] = useState<"idle" | "parsing" | "done" | "error">("idle");
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfError, setPdfError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    setPdfStatus("parsing");
    setPdfError("");

    try {
      const rawText = await extractTextFromPdf(file);
      const parsed = await parseResume(rawText);
      setFormData(parsed);
      setPdfStatus("done");
    } catch {
      setPdfStatus("error");
      setPdfError("PDF 텍스트 추출에 실패했어요. 직접 입력 탭을 이용해 주세요.");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isReady = !!formData.name.trim() && !!formData.position.trim();

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

      <StepIndicator currentStep={1} totalSteps={3} labels={["이력서", "채용공고", "면접"]} />

      <div className="flex-1 px-5 pb-28 overflow-y-auto">
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "upload" ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            PDF 업로드
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "manual" ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            직접 입력
          </button>
        </div>

        {activeTab === "upload" && (
          <div className="animate-fade-in space-y-4">
            {/* Upload zone */}
            {pdfStatus !== "done" && (
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 cursor-pointer">
                <div className="w-24 h-24 flex items-center justify-center">
                  {pdfStatus === "parsing" ? (
                    <Loader2 size={36} className="text-primary-600 animate-spin" />
                  ) : (
                    <Lottie
                      path="/lottie/pdf.json"
                      loop
                      autoplay
                      style={{ width: "100%", height: "100%" }}
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    {pdfStatus === "parsing" ? "PDF 분석 중..." : "PDF 파일을 선택하세요"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {pdfStatus === "parsing"
                      ? "AI가 이력서 내용을 읽고 있어요"
                      : "이력서 PDF를 업로드하면 자동으로 분석해요"}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  disabled={pdfStatus === "parsing"}
                  onChange={handleFileChange}
                />
                {pdfStatus !== "parsing" && (
                  <span className="mt-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary-700 transition-colors cursor-pointer">
                    파일 선택하기
                  </span>
                )}
              </label>
            )}

            {/* Error state */}
            {pdfStatus === "error" && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-red-600">{pdfError}</p>
                  <button
                    onClick={() => setActiveTab("manual")}
                    className="text-xs text-primary-600 font-semibold mt-1.5 underline cursor-pointer"
                  >
                    직접 입력으로 전환 →
                  </button>
                </div>
              </div>
            )}

            {/* Success: parsed form */}
            {pdfStatus === "done" && (
              <div className="animate-scale-in space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <FileCheck size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800">이력서를 불러왔어요 ✨</p>
                    <p className="text-xs text-green-600 mt-0.5 truncate">{pdfFileName}</p>
                  </div>
                  <label className="text-xs text-primary-600 font-medium cursor-pointer hover:underline shrink-0">
                    다시 업로드
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-slate-400 text-center">아래 내용을 확인하고 수정할 수 있어요</p>
              </div>
            )}
          </div>
        )}

        {/* Form — shown always in manual tab, or after successful PDF parse */}
        {(activeTab === "manual" || pdfStatus === "done") && (
          <div className={`space-y-4 ${pdfStatus === "done" ? "mt-2" : ""}`}>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <User size={14} className="text-primary-500" /> 이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <Briefcase size={14} className="text-primary-500" /> 희망 직무
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange("position", e.target.value)}
                placeholder="프론트엔드 개발자"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <FolderOpen size={14} className="text-primary-500" /> 경력 요약
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                rows={3}
                placeholder="스타트업에서 React 기반 웹 서비스를 3년간 개발..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <Code size={14} className="text-primary-500" /> 기술 스택
              </label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => handleChange("techStack", e.target.value)}
                placeholder="React, TypeScript, Node.js"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <FolderOpen size={14} className="text-primary-500" /> 주요 프로젝트
              </label>
              <textarea
                value={formData.projects}
                onChange={(e) => handleChange("projects", e.target.value)}
                rows={3}
                placeholder="커머스 장바구니 리뉴얼 (전환율 18% 개선)&#10;디자인 시스템 구축 및 사내 도입"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
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
          disabled={!isReady || pdfStatus === "parsing"}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-primary-600/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-[15px] hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pdfStatus === "parsing" ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          {pdfStatus === "parsing" ? "분석 중..." : "다음"}
        </button>
      </div>
    </div>
  );
}
