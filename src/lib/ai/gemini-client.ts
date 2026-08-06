/**
 * SERVER-ONLY. Never import this file from a "use client" component —
 * it reads GEMINI_API_KEY directly, which must never reach the browser.
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
  disableThinking?: boolean; // NEW
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
        // gemini-3.6-flash is Gemini-3.x family: it uses thinkingLevel
        // (low/medium/high), NOT thinkingBudget (that's the 2.5-series field).
        // Gemini 3 Flash can't fully disable thinking, so "low" is the
        // minimum — still much cheaper than the default "medium".
        ...(input.disableThinking ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini API error (${response.status}): ${errText || response.statusText}`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  const finishReason = candidate?.finishReason;

  if (!text) {
    throw new Error(`Gemini returned an empty response (finishReason: ${finishReason ?? "unknown"}).`);
  }

  if (finishReason === "MAX_TOKENS") {
    // Output was cut off — this is the bug you were chasing. Fail loudly
    // instead of silently returning a truncated string to the caller.
    throw new Error(
      `Gemini response was truncated (finishReason: MAX_TOKENS). Increase maxOutputTokens or reduce thinking. Partial text: ${text}`
    );
  }

  return text.trim();
}