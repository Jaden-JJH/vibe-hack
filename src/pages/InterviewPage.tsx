import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles, Lightbulb, CheckCircle } from "lucide-react";
import { useInterviewStore } from "../store/interviewStore";
import { generateFollowUp } from "../services/claudeService";
import { interviewQuestions as fallbackQuestions } from "../data/dummy";

const FOLLOW_UP_THRESHOLD = 2;

export default function InterviewPage() {
  const navigate = useNavigate();

  const {
    questions: storeQuestions,
    chatMessages,
    currentQuestionIndex,
    resumeInput,
    jobInput,
    addChatMessage,
    advanceQuestion,
  } = useInterviewStore();

  const questions = storeQuestions.length > 0 ? storeQuestions : fallbackQuestions;
  const totalQuestions = questions.length;

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [interviewDone, setInterviewDone] = useState(false);
  const [userAnswerCount, setUserAnswerCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // No cleanup return — initializedRef prevents double-fire in StrictMode
    setTimeout(() => {
      sendAiMessage(questions[0].question);
    }, 600);
  }, []);

  const sendAiMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      addChatMessage("ai", text);
      setIsTyping(false);
    }, 800);
  };

  const handleSend = async () => {
    if (!input.trim() || interviewDone || isTyping) return;

    const userText = input.trim();
    setInput("");
    addChatMessage("user", userText);

    const newAnswerCount = userAnswerCount + 1;
    setUserAnswerCount(newAnswerCount);

    // 답변이 FOLLOW_UP_THRESHOLD의 배수일 때 다음 질문으로, 아닐 때 꼬리물기
    // e.g. threshold=2: 1번째→꼬리물기, 2번째→다음 질문, 3번째→꼬리물기, 4번째→다음 질문
    const shouldFollowUp =
      newAnswerCount % FOLLOW_UP_THRESHOLD !== 0 &&
      currentQuestionIndex < totalQuestions - 1;

    if (shouldFollowUp) {
      setIsTyping(true);
      const allMessages = [
        ...chatMessages,
        { id: `user-${Date.now()}`, role: "user" as const, content: userText },
      ];
      try {
        const followUp = await generateFollowUp(allMessages, resumeInput, jobInput);
        addChatMessage("ai", followUp);
      } catch {
        addChatMessage("ai", "방금 말씀하신 경험에서 본인이 기여한 부분을 더 구체적으로 말씀해주시겠어요?");
      } finally {
        setIsTyping(false);
      }
      return;
    }

    const nextIdx = currentQuestionIndex + 1;
    advanceQuestion();

    if (nextIdx < totalQuestions) {
      sendAiMessage(questions[nextIdx].question);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        addChatMessage(
          "ai",
          "수고하셨습니다! 모든 면접 질문에 답변해주셨네요. 🎉\n결과 리포트를 확인해보세요."
        );
        setIsTyping(false);
        setInterviewDone(true);
      }, 1000);
    }
  };

  const handleSampleAnswer = () => {
    if (interviewDone) return;
    const current = questions[currentQuestionIndex];
    if (current?.sampleAnswer) {
      setInput(current.sampleAnswer);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasSampleAnswer = !!questions[currentQuestionIndex]?.sampleAnswer;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-slate-100 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">AI 면접관</h2>
              <p className="text-[11px] text-slate-400">인터뷰메이트</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-primary-50 rounded-full">
            <span className="text-xs font-semibold text-primary-600">
              질문 {Math.min(currentQuestionIndex + 1, totalQuestions)} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${
                interviewDone
                  ? 100
                  : ((currentQuestionIndex + 1) / totalQuestions) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-br-md"
                  : "bg-slate-100 text-slate-700 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mr-2 mt-1 shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
              <div className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
              <div className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Section */}
      <div className="shrink-0 bg-white border-t border-slate-100">
        {!interviewDone ? (
          <>
            {hasSampleAnswer && (
              <div className="px-4 pt-3">
                <button
                  onClick={handleSampleAnswer}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-medium hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Lightbulb size={14} />
                  예시 답변으로 채우기
                </button>
              </div>
            )}

            <div className="p-4 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="답변을 입력하세요..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="p-5">
            <button
              id="view-result-btn"
              onClick={() => navigate("/result")}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-primary-600/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-[15px] hover:shadow-xl cursor-pointer"
            >
              <CheckCircle size={18} />
              결과 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
