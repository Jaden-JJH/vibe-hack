import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_CHARS = 120000;

async function fetchWithTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.query;
  if (!url || typeof url !== "string") return res.status(400).json({ error: "url 파라미터가 필요합니다." });

  try { new URL(url); } catch {
    return res.status(400).json({ error: "유효하지 않은 URL입니다." });
  }

  // 1차: Jina Reader — 헤드리스 브라우저로 JS 렌더링까지 처리
  try {
    const jinaRes = await fetchWithTimeout(
      `https://r.jina.ai/${url}`,
      {
        headers: {
          Accept: "text/plain",
          "X-Return-Format": "text",
          "X-No-Cache": "true",
        },
      },
      25000
    );
    if (jinaRes.ok) {
      const text = (await jinaRes.text()).trim();
      if (text.length > 100) {
        res.setHeader("Cache-Control", "s-maxage=300");
        return res.status(200).json({ rawText: text.slice(0, MAX_CHARS) });
      }
    }
  } catch {
    // fall through
  }

  // 2차: 직접 fetch (정적 사이트용 fallback)
  try {
    const directRes = await fetchWithTimeout(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
        },
      },
      15000
    );

    if (!directRes.ok) {
      return res.status(directRes.status).json({ error: `페이지 응답 오류 (${directRes.status})` });
    }

    const html = await directRes.text();
    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ html: html.slice(0, MAX_CHARS) });
  } catch (err) {
    const msg = err instanceof Error && err.name === "AbortError"
      ? "요청 시간이 초과됐어요."
      : "페이지를 가져오지 못했어요.";
    return res.status(502).json({ error: msg });
  }
}
