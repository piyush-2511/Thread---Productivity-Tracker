import { createClient } from "@/lib/supabase/client";
import type { DietPlanMeal, NutritionTarget, DietLog } from "@/lib/types/database.types";
import { todayISO } from "@/lib/utils/date-helpers";

/** JS Date.getDay() already returns 0=Sunday..6=Saturday, matching day_of_week in the schema. */
export function currentDayOfWeek(): number {
  return new Date().getDay();
}

// ---------- Weekly plan ----------

export async function getPlanForDay(dayOfWeek: number): Promise<DietPlanMeal[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("diet_plan_meals")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getFullWeekPlan(): Promise<DietPlanMeal[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("diet_plan_meals")
    .select("*")
    .order("day_of_week", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addPlanMeal(input: {
  day_of_week: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  food_name: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}): Promise<DietPlanMeal> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("diet_plan_meals")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePlanMeal(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("diet_plan_meals").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Targets ----------

export async function getNutritionTargets(): Promise<NutritionTarget | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("nutrition_targets").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveNutritionTargets(input: {
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fat_g?: number;
}): Promise<NutritionTarget> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("nutrition_targets")
    .upsert({ ...input, user_id: user.id }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---------- Daily logging ----------

export async function getTodayDietLogs(): Promise<DietLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("diet_logs").select("*").eq("log_date", todayISO());
  if (error) throw error;
  return data ?? [];
}

export async function logMealEaten(planMealId: string, isEaten: boolean): Promise<DietLog> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // One log row per (user, plan meal, day) — check for an existing row first, same
  // upsert-by-hand pattern used for thoughts and screen time, since the unique
  // constraint here isn't a simple composite key we can target with onConflict.
  const { data: existing } = await supabase
    .from("diet_logs")
    .select("*")
    .eq("diet_plan_meal_id", planMealId)
    .eq("log_date", todayISO())
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("diet_logs")
      .update({ is_eaten: isEaten })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("diet_logs")
    .insert({ diet_plan_meal_id: planMealId, is_eaten: isEaten, user_id: user.id, log_date: todayISO() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Sums today's eaten meals against the planned macros, PLUS any ad-hoc entries
 * (diet_plan_meal_id null, logged via AI quick-log) that carry their own actual_* values.
 */
export function sumEatenMacros(logs: DietLog[], planMeals: DietPlanMeal[]) {
  const eatenIds = new Set(
    logs.filter((l) => l.is_eaten && l.diet_plan_meal_id).map((l) => l.diet_plan_meal_id)
  );
  const eatenPlanMeals = planMeals.filter((m) => eatenIds.has(m.id));
  const adHocLogs = logs.filter((l) => l.is_eaten && !l.diet_plan_meal_id);

  const fromPlan = eatenPlanMeals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein_g: totals.protein_g + meal.protein_g,
      carbs_g: totals.carbs_g + meal.carbs_g,
      fat_g: totals.fat_g + meal.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  return adHocLogs.reduce(
    (totals, log) => ({
      calories: totals.calories + (log.actual_calories ?? 0),
      protein_g: totals.protein_g + (log.actual_protein_g ?? 0),
      carbs_g: totals.carbs_g + (log.actual_carbs_g ?? 0),
      fat_g: totals.fat_g + (log.actual_fat_g ?? 0),
    }),
    fromPlan
  );
}

/** Ad-hoc entries only (no linked plan meal) — for rendering the "Quick logged" list separately. */
export function getAdHocEntries(logs: DietLog[]): DietLog[] {
  return logs.filter((l) => !l.diet_plan_meal_id && l.is_eaten);
}
