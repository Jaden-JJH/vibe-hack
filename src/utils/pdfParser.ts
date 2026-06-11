import * as pdfjsLib from "pdfjs-dist";
import Anthropic from "@anthropic-ai/sdk";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

const MIN_CHARS = 50;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(
      String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)))
    );
  }
  return btoa(chunks.join(""));
}

async function extractWithPdfJs(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item): item is pdfjsLib.TextItem => "str" in item)
      .map((item) => item.str)
      .join(" ");
    pageTexts.push(text);
  }
  return pageTexts.join("\n").replace(/\s+/g, " ").trim();
}

async function extractWithClaude(arrayBuffer: ArrayBuffer): Promise<string> {
  const client = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  const base64 = arrayBufferToBase64(arrayBuffer);
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          } as Parameters<typeof client.messages.create>[0]["messages"][0]["content"][0],
          {
            type: "text",
            text: "이 PDF의 모든 텍스트를 그대로 추출해 출력하세요. 설명이나 마크다운 없이 원문만 출력하세요.",
          },
        ],
      },
    ],
  });
  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text.trim();
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const text = await extractWithPdfJs(arrayBuffer);
    if (text.length >= MIN_CHARS) return text;
  } catch {
    // fall through to Claude
  }
  return extractWithClaude(arrayBuffer);
}
