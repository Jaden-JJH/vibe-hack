import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_TEXT_LENGTH = 12000;
const FETCH_TIMEOUT_MS = 15000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url query param required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `페이지 응답 오류 (${response.status})` });
    }

    const html = await response.text();
    const truncated = html.slice(0, MAX_TEXT_LENGTH * 10);

    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ html: truncated });
  } catch (err) {
    const message = err instanceof Error && err.name === "AbortError"
      ? "요청 시간이 초과됐어요."
      : "페이지를 가져오지 못했어요.";
    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timeoutId);
  }
}
