/**
 * SERVER-ONLY. Never import this file from a "use client" component —
 * it reads GEMINI_API_KEY directly, which must never reach the browser.
 * The only caller should be app/api/coach/route.ts.
 */

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type ChatTurn = { role: "user" | "model"; text: string };

export async function askGemini(input: {
  systemInstruction: string;
  history: ChatTurn[];
  message: string;
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to your server environment (never NEXT_PUBLIC_*).");
  }

  const contents = [
    ...input.history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
    { role: "user", parts: [{ text: input.message }] },
  ];

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: input.systemInstruction }] },
      contents,
      generationConfig: {
        temperature: input.temperature ?? 0.6,
        maxOutputTokens: input.maxOutputTokens ?? 400,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini API error (${response.status}): ${errText || response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text.trim();
}
