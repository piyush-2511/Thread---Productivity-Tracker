/**
 * SERVER-ONLY. Generates a short, time-of-day-aware greeting line.
 * Deliberately the cheapest possible Gemini call in the app:
 * - No user data context (unlike the Coach, which needs it)
 * - maxOutputTokens capped at 20 — this is one short sentence, not a chat reply
 * - Cached in ai_greetings, one row per user per day per time bucket, so a
 *   given user triggers at most 4 Gemini calls a day for this feature,
 *   regardless of how many times they open the app
 */
import { createClient } from "@/lib/supabase/server";
import { askGemini } from "@/lib/ai/gemini-client";

export type TimeBucket = "morning" | "afternoon" | "evening" | "night";

export function getTimeBucket(date: Date = new Date()): TimeBucket {
  const hour = date.getHours();
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

const BUCKET_PROMPTS: Record<TimeBucket, string> = {
  morning: "Write one short, warm morning greeting line (max 12 words) for a productivity app. No quotes, no emoji, no name placeholder.",
  afternoon: "Write one short, energizing afternoon greeting line (max 12 words) for a productivity app. No quotes, no emoji, no name placeholder.",
  evening: "Write one short, reflective evening greeting line (max 12 words) for a productivity app. No quotes, no emoji, no name placeholder.",
  night: "Write one short, calm late-night greeting line (max 12 words) for a productivity app. No quotes, no emoji, no name placeholder.",
};

/** Simple fallbacks if Gemini is unavailable or the key isn't set — the app should never block on this. */
const FALLBACKS: Record<TimeBucket, string[]> = {
  morning: ["A fresh page. Let's write today well.", "Small starts, real momentum.", "Morning — best time to begin."],
  afternoon: ["Halfway through — keep the thread going.", "A good moment to check in with yourself.", "Steady pace wins the day."],
  evening: ["Time to wind down the thread.", "Look back before you look ahead.", "Evening — a good time to reflect."],
  night: ["Rest well. Tomorrow's thread starts fresh.", "A quiet close to the day.", "Late one — don't forget to rest."],
};

export async function getGreeting(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Welcome back.";

  const today = new Date().toISOString().split("T")[0];
  const bucket = getTimeBucket();

  // Cache check first — this is the "critical token usage" guardrail
  const { data: cached } = await supabase
    .from("ai_greetings")
    .select("message")
    .eq("greeting_date", today)
    .eq("time_bucket", bucket)
    .maybeSingle();

  if (cached) return cached.message;

  // No cache hit for this bucket today — one small Gemini call, then cache it
  let message: string;
  try {
    message = await askGemini({
      systemInstruction: BUCKET_PROMPTS[bucket],
      history: [],
      message: "Generate the line now.",
      maxOutputTokens: 60,
      temperature: 0.9,
      disableThinking : true
    });
    // Guard against runaway output despite maxOutputTokens
    message = message.split("\n")[0].slice(0, 140);
  } catch {
    const options = FALLBACKS[bucket];
    message = options[Math.floor(Math.random() * options.length)];
  }

  await supabase.from("ai_greetings").upsert(
    { user_id: user.id, greeting_date: today, time_bucket: bucket, message },
    { onConflict: "user_id,greeting_date,time_bucket" }
  );

  return message;
}
