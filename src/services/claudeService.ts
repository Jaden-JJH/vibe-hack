import Anthropic from "@anthropic-ai/sdk";
import type { ResumeInput, JobInput, InterviewQuestion, ChatMessage, ReportData } from "../types";
import { interviewQuestions as fallbackQuestions, dummyReport } from "../data/dummy";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

function parseJson<T>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

// --- Resume text → structured fields (Haiku: fast structuring) ---
export async function parseResume(rawText: string): Promise<ResumeInput> {
  const prompt = `아래 이력서 텍스트에서 정보를 추출하여 JSON으로 반환하세요.

[이력서 텍스트]
${rawText.slice(0, 6000)}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 금지):
{"name":"이름","position":"희망 직무 또는 현재 직무","experience":"경력 요약 (2-3 문장)","techStack":"기술 스택 (쉼표로 구분)","projects":"주요 프로젝트 (줄바꿈으로 구분)"}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = parseJson<ResumeInput>(text);
    if (parsed?.name) return parsed;
    throw new Error("parse failed");
  } catch {
    return {
      name: "",
      position: "",
      experience: rawText.slice(0, 300),
      techStack: "",
      projects: "",
    };
  }
}

// --- Job posting text → structured fields (Haiku) ---
export async function parseJobPosting(rawText: string): Promise<JobInput> {
  const prompt = `아래 채용공고 텍스트에서 정보를 추출하여 JSON으로 반환하세요.

[채용공고 텍스트]
${rawText.slice(0, 6000)}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 금지):
{"company":"회사명","position":"채용 직무","mainTasks":"주요 업무 내용","requirements":"자격 요건","preferred":"우대사항 (없으면 빈 문자열)"}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = parseJson<JobInput>(text);
    if (parsed?.company) return { ...parsed, rawText };
    throw new Error("parse failed");
  } catch {
    return {
      company: "",
      position: "",
      mainTasks: rawText.slice(0, 300),
      requirements: "",
      preferred: "",
      rawText,
    };
  }
}

// --- Question Generation (Haiku: fast, structured JSON) ---
export async function generateQuestions(
  resume: ResumeInput,
  job: JobInput
): Promise<InterviewQuestion[]> {
  const resumeText = `이름: ${resume.name}
희망 직무: ${resume.position}
경력 요약: ${resume.experience}
기술 스택: ${resume.techStack}
주요 프로젝트: ${resume.projects}`.trim();

  const jobText = job.rawText
    ? job.rawText.slice(0, 3000)
    : `회사명: ${job.company}
직무: ${job.position}
주요 업무: ${job.mainTasks}
자격요건: ${job.requirements}
우대사항: ${job.preferred}`.trim();

  const prompt = `당신은 10년 경력의 시니어 기술 면접관입니다.
아래 지원자의 이력서와 채용공고를 분석하여 실제 면접에서 사용할 맞춤형 질문 5개를 생성하세요.

[지원자 이력서]
${resumeText}

[채용공고]
${jobText}

규칙:
- 이력서의 실제 경험과 채용공고 요건을 연결하는 구체적인 질문이어야 합니다
- 꼬리물기가 가능한 개방형 질문으로 작성하세요
- 첫 번째 질문은 반드시 자기소개 또는 지원 동기로 시작하세요
- 반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 금지)

{"questions":[{"id":1,"question":"질문 내용","sampleAnswer":"모범 답변 예시"},{"id":2,"question":"질문 내용","sampleAnswer":"모범 답변 예시"},{"id":3,"question":"질문 내용","sampleAnswer":"모범 답변 예시"},{"id":4,"question":"질문 내용","sampleAnswer":"모범 답변 예시"},{"id":5,"question":"질문 내용","sampleAnswer":"모범 답변 예시"}]}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = parseJson<{ questions: InterviewQuestion[] }>(text);
    if (!parsed || !Array.isArray(parsed.questions)) throw new Error("invalid shape");
    return parsed.questions;
  } catch {
    return fallbackQuestions;
  }
}

// --- Follow-up Question Generation (Haiku: real-time chat) ---
export async function generateFollowUp(
  history: ChatMessage[],
  resume: ResumeInput,
  job: JobInput
): Promise<string> {
  const contextSummary = `지원자: ${resume.name} / ${resume.position} / 기술스택: ${resume.techStack}
채용 직무: ${job.company} ${job.position}`;

  const historyText = history
    .map((m) => `${m.role === "ai" ? "면접관" : "지원자"}: ${m.content}`)
    .join("\n");

  const prompt = `당신은 경험 많은 기술 면접관입니다.

[면접 컨텍스트]
${contextSummary}

[지금까지의 면접 대화]
${historyText}

지원자의 마지막 답변을 바탕으로 자연스러운 꼬리물기 질문 1개만 생성하세요.
질문만 출력하고 다른 설명은 하지 마세요.`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    return text || "방금 말씀하신 부분에서 가장 어려웠던 점은 무엇이었나요?";
  } catch {
    return "방금 말씀하신 경험에서 본인이 기여한 부분을 더 구체적으로 말씀해주시겠어요?";
  }
}

// --- Interview Evaluation (Sonnet: complex reasoning, accuracy) ---
export async function evaluateInterview(
  messages: ChatMessage[],
  resume: ResumeInput,
  job: JobInput
): Promise<ReportData> {
  const qaText = messages
    .map((m) => `[${m.role === "ai" ? "면접관" : "지원자"}] ${m.content}`)
    .join("\n");

  const prompt = `당신은 채용 전문가이자 면접 평가 전문가입니다.
아래 면접 Q&A 전체를 분석하여 지원자를 종합 평가하세요.

[지원자 정보]
이름: ${resume.name} / 직무: ${resume.position}
기술스택: ${resume.techStack}

[채용 직무]
${job.company} - ${job.position}

[면접 대화 전문]
${qaText}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 금지):
{"totalScore":0~100 사이 정수,"categories":[{"label":"직무 적합성","score":0~100,"color":"#6366f1"},{"label":"답변 구체성","score":0~100,"color":"#8b5cf6"},{"label":"논리성","score":0~100,"color":"#a78bfa"},{"label":"커뮤니케이션","score":0~100,"color":"#c4b5fd"}],"strengths":["강점1","강점2","강점3"],"improvements":["개선점1","개선점2","개선점3"],"feedbacks":[{"questionId":1,"question":"질문 요약","comment":"구체적 피드백"}]}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = parseJson<ReportData>(text);
    if (!parsed) throw new Error("parse failed");
    return parsed;
  } catch {
    return dummyReport;
  }
}
