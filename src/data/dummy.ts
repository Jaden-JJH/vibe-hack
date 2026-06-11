// ============================================================
// Dummy data for InterviewMate prototype
// All data is hardcoded for demo purposes — no API calls.
// ============================================================

import type {
  InterviewQuestion,
  CategoryScore,
  FeedbackItem,
  ReportData,
} from "../types";

export interface ResumeData {
  name: string;
  position: string;
  experienceSummary: string;
  techStack: string[];
  projects: string[];
}

export interface JobPostingData {
  company: string;
  position: string;
  mainTasks: string;
  requirements: string;
  preferred: string;
}

export type { InterviewQuestion, CategoryScore, FeedbackItem, ReportData };

// --- Resume ---
export const dummyResume: ResumeData = {
  name: "김지원",
  position: "프론트엔드 개발자 (3년차)",
  experienceSummary:
    "스타트업에서 React 기반 웹 서비스를 3년간 개발. 사용자 1만명 규모 커머스 서비스의 프론트엔드 전반을 담당.",
  techStack: ["React", "TypeScript", "Next.js", "Tailwind", "Zustand"],
  projects: [
    "커머스 장바구니 리뉴얼 (전환율 18% 개선)",
    "디자인 시스템 구축 및 사내 도입",
  ],
};

// --- Job Posting ---
export const dummyJobPosting: JobPostingData = {
  company: "토스랩(가상)",
  position: "프론트엔드 엔지니어",
  mainTasks:
    "React 기반 웹 프로덕트 개발, 성능 최적화, 디자인 시스템 운영",
  requirements:
    "React/TypeScript 실무 3년 이상, 상태관리 경험, 협업 능력",
  preferred:
    "Next.js SSR 경험, 테스트 코드 작성, 대규모 트래픽 경험",
};

// --- Interview Questions & Sample Answers ---
export const interviewQuestions: InterviewQuestion[] = [
  {
    id: 1,
    question:
      "간단한 자기소개와 함께, 본인이 가장 자신 있는 기술 영역을 말씀해주세요.",
    sampleAnswer:
      "안녕하세요, 3년차 프론트엔드 개발자 김지원입니다. React와 TypeScript를 기반으로 사용자 경험 중심의 웹 서비스를 개발해 왔습니다. 특히 컴포넌트 설계와 상태 관리에 자신이 있으며, 디자인 시스템을 처음부터 구축하고 사내에 도입한 경험이 가장 큰 강점이라고 생각합니다.",
  },
  {
    id: 2,
    question:
      "커머스 장바구니 리뉴얼로 전환율을 18% 개선하셨는데, 구체적으로 어떤 접근을 하셨나요?",
    sampleAnswer:
      "기존 장바구니 페이지의 사용자 이탈 데이터를 분석해 UX 병목 지점을 찾았습니다. 핵심은 3가지였는데요. 먼저 상품 수량 변경 시 즉각적인 가격 반영, 다음으로 결제 버튼까지의 스크롤 최소화, 마지막으로 쿠폰 적용 프로세스 간소화였습니다. React Query를 활용해 서버 상태를 실시간으로 동기화하고, 레이아웃을 모바일 우선으로 재설계하여 전환율이 18% 개선되었습니다.",
  },
  {
    id: 3,
    question:
      "디자인 시스템을 구축하면서 가장 어려웠던 점과 해결 방법은 무엇이었나요?",
    sampleAnswer:
      "가장 큰 어려움은 디자이너와 개발자 간의 용어와 컴포넌트 구조 차이를 좁히는 것이었습니다. 이를 해결하기 위해 Figma 토큰을 코드로 자동 변환하는 파이프라인을 만들고, 디자인 토큰의 네이밍 컨벤션을 함께 정의했습니다. 또한 Storybook을 도입해 디자이너가 직접 컴포넌트를 확인하고 피드백할 수 있는 환경을 구축했습니다.",
  },
  {
    id: 4,
    question:
      "대규모 트래픽 상황에서 프론트엔드 성능을 최적화한 경험이 있다면 설명해주세요.",
    sampleAnswer:
      "프로모션 이벤트 시 평소 대비 5배 이상의 트래픽이 몰렸을 때, 번들 사이즈 최적화와 코드 스플리팅으로 초기 로딩 속도를 개선했습니다. lazy loading과 Intersection Observer를 활용해 이미지와 컴포넌트의 지연 로딩을 구현했고, CDN 캐싱 전략을 재정비했습니다. 결과적으로 LCP를 2.5초에서 1.2초로 줄였습니다.",
  },
  {
    id: 5,
    question:
      "팀에서 의견 충돌이 있었을 때 어떻게 협업하며 해결했는지 사례를 들어주세요.",
    sampleAnswer:
      "상태관리 라이브러리 선택에서 의견이 갈렸던 적이 있습니다. 저는 Zustand을, 동료는 Redux Toolkit을 주장했는데요. 각자 장단점을 정리한 문서를 작성한 뒤 팀 미팅에서 발표하고 투표했습니다. 최종적으로 프로젝트 규모와 학습 곡선을 고려해 Zustand을 채택했고, 반대 의견을 낸 동료에게는 코드 리뷰어 역할을 부탁해 품질을 함께 관리했습니다.",
  },
];

// --- Report ---
export const dummyReport: ReportData = {
  totalScore: 82,
  categories: [
    { label: "직무 적합성", score: 88, color: "#6366f1" },
    { label: "답변 구체성", score: 79, color: "#8b5cf6" },
    { label: "논리성", score: 84, color: "#a78bfa" },
    { label: "커뮤니케이션", score: 80, color: "#c4b5fd" },
  ],
  strengths: [
    "구체적 수치(전환율 18%)로 성과를 설명함",
    "기술 선택의 이유를 논리적으로 제시함",
    "협업 사례가 명확함",
  ],
  improvements: [
    "일부 답변이 결론부터 말하면 더 좋음(두괄식)",
    "트래픽 최적화 답변에 구체적 지표가 부족함",
    "STAR 구조를 활용하면 설득력 상승",
  ],
  feedbacks: [
    {
      questionId: 1,
      question: "자기소개 및 강점",
      comment:
        "자신의 강점을 명확히 어필했지만, 구체적인 수치나 사례를 함께 언급하면 더 인상적입니다.",
    },
    {
      questionId: 2,
      question: "장바구니 리뉴얼",
      comment:
        "데이터 기반 접근이 돋보였습니다. 팀 협업 과정도 함께 설명하면 좋습니다.",
    },
    {
      questionId: 3,
      question: "디자인 시스템 구축",
      comment:
        "문제 해결 과정이 체계적입니다. 도입 후 효과(생산성 향상 등)도 수치로 표현해보세요.",
    },
    {
      questionId: 4,
      question: "성능 최적화",
      comment:
        "기술적 접근은 좋으나, 비즈니스 임팩트를 함께 설명하면 설득력이 높아집니다.",
    },
    {
      questionId: 5,
      question: "협업 사례",
      comment:
        "합리적 의사결정 과정을 잘 보여줬습니다. 상대방을 배려한 부분이 인상적입니다.",
    },
  ],
};
