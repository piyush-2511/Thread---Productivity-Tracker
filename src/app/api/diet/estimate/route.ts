import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { estimateNutrition } from "@/lib/ai/nutrition-estimator";

/**
 * POST { description, meal_type, log_date? }
 * Estimates nutrition via Gemini and saves an ad-hoc diet_logs row
 * (diet_plan_meal_id left null — this isn't tied to the weekly plan).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const description: string = body.description;
  const mealType: string | undefined = body.meal_type;
  const logDate: string = body.log_date ?? new Date().toISOString().split("T")[0];

  if (!description || !description.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const nutrition = await estimateNutrition(description.trim());

    const { data, error } = await supabase
      .from("diet_logs")
      .insert({
        user_id: user.id,
        log_date: logDate,
        description: description.trim(),
        meal_type: mealType ?? null,
        is_eaten: true,
        actual_calories: nutrition.calories,
        actual_protein_g: nutrition.protein_g,
        actual_carbs_g: nutrition.carbs_g,
        actual_fat_g: nutrition.fat_g,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, nutrition }, { status: 201 });
  } catch (error) {
    console.error("Diet estimate API error:", error);
    const msg = error instanceof Error ? error.message : "Failed to estimate nutrition.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
