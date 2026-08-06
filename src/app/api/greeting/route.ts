import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGreeting } from "@/lib/ai/greeting";

/** Cached, time-bucketed — see lib/ai/greeting.ts for the token-usage guardrails. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const message = await getGreeting();
    return NextResponse.json({ message });
  } catch (error) {
    console.error("Greeting API error:", error);
    return NextResponse.json({ message: "Welcome back." });
  }
}
