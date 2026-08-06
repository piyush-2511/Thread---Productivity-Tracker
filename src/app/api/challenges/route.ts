import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("challenges").select("*").eq("is_active", true);

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
  if (!body.title || !body.duration_days) {
    return NextResponse.json({ error: "title and duration_days are required" }, { status: 400 });
  }

  const { data: challenge, error } = await supabase
    .from("challenges")
    .insert({
      title: body.title,
      description: body.description,
      duration_days: body.duration_days,
      start_date: body.start_date,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (Array.isArray(body.taskTitles) && body.taskTitles.length > 0) {
    await supabase
      .from("challenge_tasks")
      .insert(body.taskTitles.map((title: string) => ({ challenge_id: challenge.id, title })));
  }

  return NextResponse.json({ data: challenge }, { status: 201 });
}
