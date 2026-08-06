import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/diet?day=0-6 returns the plan for a weekday; omit for the full week. */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const day = searchParams.get("day");

  let query = supabase.from("diet_plan_meals").select("*").order("sort_order", { ascending: true });
  if (day !== null) query = query.eq("day_of_week", Number(day));

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
  if (body.day_of_week === undefined || !body.meal_type || !body.food_name) {
    return NextResponse.json({ error: "day_of_week, meal_type, and food_name are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("diet_plan_meals")
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
