import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");

  let query = supabase.from("screen_time_logs").select("*").is("category", null).order("log_date", { ascending: true });
  if (since) query = query.gte("log_date", since);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (typeof body.minutes !== "number" || body.minutes < 0) {
    return NextResponse.json({ error: "minutes must be a non-negative number" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("screen_time_logs")
    .upsert(
      { minutes: body.minutes, goal_minutes: body.goal_minutes, user_id: user.id, category: null },
      { onConflict: "user_id,log_date,category" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
