# 인터뷰메이트 - AI 모의면접 서비스

이력서 + 채용공고를 넣으면 AI가 맞춤 면접 질문을 생성하고, 채팅으로 모의면접을 진행한 뒤 상세 피드백을 주는 웹 서비스입니다.

## 주요 기능

- **이력서 입력**: PDF 업로드 또는 직접 텍스트 입력
- **채용공고 입력**: URL 자동 파싱 또는 직접 텍스트 입력
- **AI 면접 진행**: Claude API 기반 맞춤 질문 5문 5답
- **결과 리포트**: 항목별 점수 + 개선 피드백

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속하세요.

## 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 아래 값을 입력하세요:

```
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript + Vite |
| 스타일링 | Tailwind CSS v4 |
| 라우팅 | React Router v6 |
| 상태관리 | Zustand |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| PDF 파싱 | pdfjs-dist |
| 애니메이션 | Lottie, Three.js, tsparticles |
| 아이콘 | lucide-react |

## 화면 구성

| 경로 | 화면 | 설명 |
|------|------|------|
| `/` | 홈 | 서비스 소개 + 시작 버튼 |
| `/resume` | 이력서 입력 | PDF 업로드 / 직접 입력 |
| `/job` | 채용공고 입력 | URL 불러오기 / 직접 입력 |
| `/loading` | 로딩 | AI 질문 생성 애니메이션 |
| `/interview` | 모의면접 | 채팅 UI로 5문 5답 |
| `/result` | 결과 리포트 | 점수 + 피드백 |

## 참고

- 모바일 뷰(420px) 기준으로 디자인되었으며, 데스크톱에서도 모바일 느낌으로 표시됩니다.
- Claude API 키가 없으면 AI 기능이 동작하지 않습니다.
