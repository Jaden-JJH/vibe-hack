const MAX_TEXT_LENGTH = 12000;
const MIN_TEXT_LENGTH = 50;
const FETCH_TIMEOUT_MS = 15000;

const SITE_SELECTORS: { match: (h: string) => boolean; selectors: string[] }[] = [
  {
    match: (h) => h.includes("saramin.co.kr"),
    selectors: [".user_content", ".jview", ".wrap_jv_cont", ".cont_box", ".job_summary"],
  },
  {
    match: (h) => h.includes("jumpit"),
    selectors: ["[class*='JobDescription']", "[class*='JobInfo']", "main"],
  },
  {
    match: (h) => h.includes("wanted.co.kr"),
    selectors: ["[data-testid='jobDescription']", "section[class*='JobDescription']", "article"],
  },
  {
    match: (h) => h.includes("jobplanet.co.kr"),
    selectors: [".recruitment_info_section", ".body_inner", ".content", "main"],
  },
  {
    match: (h) => h.includes("linkedin.com"),
    selectors: [".description__text", ".show-more-less-html", "article"],
  },
];

function extractFromHtml(html: string, host: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, noscript, iframe, nav, footer").forEach((el) => el.remove());

  const site = SITE_SELECTORS.find((s) => s.match(host));
  if (site) {
    for (const sel of site.selectors) {
      const el = doc.querySelector(sel);
      if (el) {
        const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
        if (text.length >= MIN_TEXT_LENGTH) return text.slice(0, MAX_TEXT_LENGTH);
      }
    }
  }

  const bodyText = (doc.body?.textContent ?? "").replace(/\s+/g, " ").trim();
  return bodyText.slice(0, MAX_TEXT_LENGTH);
}

export interface FetchResult {
  success: boolean;
  rawText?: string;
  error?: string;
}

export async function fetchJobPostingFromUrl(url: string): Promise<FetchResult> {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return { success: false, error: "유효하지 않은 URL입니다." };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const apiUrl = `/api/fetch-job?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl, { signal: controller.signal });
    const data = await res.json() as { html?: string; error?: string };

    if (!res.ok || !data.html) {
      return { success: false, error: data.error ?? `페이지 응답 오류 (${res.status})` };
    }

    const rawText = extractFromHtml(data.html, hostname);
    if (rawText.length < MIN_TEXT_LENGTH) {
      return { success: false, error: "공고 본문을 추출하지 못했어요." };
    }

    return { success: true, rawText };
  } catch {
    return {
      success: false,
      error: "이 사이트는 자동 접근을 차단하고 있어요. 채용공고 내용을 복사해서 '텍스트' 탭에 붙여넣어 주세요.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
