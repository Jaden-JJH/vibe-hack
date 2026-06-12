const MAX_TEXT_LENGTH = 12000;
const MIN_TEXT_LENGTH = 50;
const FETCH_TIMEOUT_MS = 15000;

const PROXY_BUILDERS: ((url: string) => string)[] = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

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

async function tryFetch(proxyUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(proxyUrl, { signal: controller.signal });
    if (!res.ok) return null;
    const html = await res.text();
    return html || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchJobPostingFromUrl(url: string): Promise<FetchResult> {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return { success: false, error: "유효하지 않은 URL입니다." };
  }

  for (const buildProxy of PROXY_BUILDERS) {
    const html = await tryFetch(buildProxy(url));
    if (!html) continue;

    const rawText = extractFromHtml(html, hostname);
    if (rawText.length >= MIN_TEXT_LENGTH) {
      return { success: true, rawText };
    }
  }

  return {
    success: false,
    error: "이 사이트는 자동 접근을 차단하고 있어요. 채용공고 내용을 복사해서 '텍스트' 탭에 붙여넣어 주세요.",
  };
}
