import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUserContext } from "@/lib/ai/context-builder";
import { askGemini, type ChatTurn } from "@/lib/ai/gemini-client";

const SYSTEM_INSTRUCTION = `You are the AI Coach inside a personal productivity app. The person tracks
todos, habits, challenges, diet, energy, and screen time. You'll be given a summary of their recent
data before each message — use it directly and specifically in your answers (cite actual numbers,
streaks, and patterns from the summary) rather than giving generic advice.

Keep answers concise (a few short paragraphs at most), warm but direct, and grounded only in the data
provided. If the data doesn't cover what they're asking, say so plainly rather than guessing. Never
invent specific numbers that weren't in the summary.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const message: string = body.message;
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    // Pull recent chat history (last 20 messages) for conversational continuity
    const { data: historyRows } = await supabase
      .from("chat_messages")
      .select("role, content")
      .order("created_at", { ascending: true })
      .limit(20);

    const history: ChatTurn[] = (historyRows ?? []).map((row) => ({
      role: row.role === "assistant" ? "model" : "user",
      text: row.content,
    }));

    const userContext = await buildUserContext();
    const systemInstruction = `${SYSTEM_INSTRUCTION}\n\n--- User's recent data ---\n${userContext}`;

    const reply = await askGemini({ systemInstruction, history, message: message.trim() });

    // Persist both turns
    await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message.trim() },
      { user_id: user.id, role: "assistant", content: reply },
    ]);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Coach API error:", error);
    const msg = error instanceof Error ? error.message : "Something went wrong talking to the AI Coach.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
