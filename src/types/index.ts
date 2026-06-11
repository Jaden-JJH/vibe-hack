export interface ResumeInput {
  name: string;
  position: string;
  experience: string;
  techStack: string;
  projects: string;
}

export interface JobInput {
  company: string;
  position: string;
  mainTasks: string;
  requirements: string;
  preferred: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  sampleAnswer?: string;
}

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  content: string;
}

export interface CategoryScore {
  label: string;
  score: number;
  color: string;
}

export interface FeedbackItem {
  questionId: number;
  question: string;
  comment: string;
}

export interface ReportData {
  totalScore: number;
  categories: CategoryScore[];
  strengths: string[];
  improvements: string[];
  feedbacks: FeedbackItem[];
}
