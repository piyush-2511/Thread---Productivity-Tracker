import { createClient } from "@/lib/supabase/client";
import { lastNDates } from "@/lib/utils/date-helpers";
import type { Habit, HabitLog, EnergyLog } from "@/lib/types/database.types";

export type DailyCompletionRow = { log_date: string; completed_count: number; total_count: number; completion_rate: number };
export type DailyNutritionRow = { log_date: string; total_calories: number | null; total_protein_g: number | null; total_carbs_g: number | null; total_fat_g: number | null };

/** Backed by the daily_completion_summary view (habit_logs + daily_task_logs combined). */
export async function getDailyCompletionSummary(days = 30): Promise<DailyCompletionRow[]> {
  const supabase = createClient();
  const since = lastNDates(days)[0];

  const { data, error } = await supabase
    .from("daily_completion_summary")
    .select("*")
    .gte("log_date", since)
    .order("log_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DailyCompletionRow[];
}

/** Backed by the daily_nutrition_summary view. */
export async function getDailyNutritionSummary(days = 30): Promise<DailyNutritionRow[]> {
  const supabase = createClient();
  const since = lastNDates(days)[0];

  const { data, error } = await supabase
    .from("daily_nutrition_summary")
    .select("*")
    .gte("log_date", since)
    .order("log_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DailyNutritionRow[];
}

/** Per-habit completion rate over the window — feeds the habit comparison bar chart. */
export async function getHabitComparison(days = 30): Promise<{ habit: Habit; rate: number }[]> {
  const supabase = createClient();
  const since = lastNDates(days)[0];

  const { data: habits, error: habitsError } = await supabase.from("habits").select("*").eq("is_active", true);
  if (habitsError) throw habitsError;

  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("*")
    .gte("log_date", since);
  if (logsError) throw logsError;

  const allLogs = (logs ?? []) as HabitLog[];

  return (habits ?? []).map((habit) => {
    const habitLogs = allLogs.filter((l) => l.habit_id === habit.id);
    const completed = habitLogs.filter((l) => l.is_completed).length;
    const rate = days > 0 ? Math.round((completed / days) * 100) : 0;
    return { habit, rate };
  });
}

/** Buckets energy check-ins by time of day, averaged across the window — feeds the energy chart. */
export async function getEnergyByTimeOfDay(days = 30): Promise<{ bucket: string; avgScore: number }[]> {
  const supabase = createClient();
  const since = lastNDates(days)[0];

  const { data, error } = await supabase.from("energy_logs").select("*").gte("log_date", since);
  if (error) throw error;

  const logs = (data ?? []) as EnergyLog[];
  const score = { low: 1, medium: 2, high: 3 } as const;

  const buckets: Record<string, number[]> = { Morning: [], Noon: [], Afternoon: [], Evening: [] };
  logs.forEach((log) => {
    const hour = new Date(log.logged_at).getHours();
    const bucket = hour < 11 ? "Morning" : hour < 14 ? "Noon" : hour < 18 ? "Afternoon" : "Evening";
    buckets[bucket].push(score[log.energy_level]);
  });

  return Object.entries(buckets).map(([bucket, scores]) => ({
    bucket,
    avgScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 33.3) : 0,
  }));
}

/** Correlates screen time with the same day's completion rate — feeds the screen-time insight card. */
export async function getScreenTimeCorrelation(days = 30): Promise<{ underGoalAvg: number; overGoalAvg: number }> {
  const supabase = createClient();
  const since = lastNDates(days)[0];

  const [{ data: screenLogs, error: e1 }, completion] = await Promise.all([
    supabase.from("screen_time_logs").select("*").gte("log_date", since).is("category", null),
    getDailyCompletionSummary(days),
  ]);
  if (e1) throw e1;

  const completionByDate = new Map(completion.map((c) => [c.log_date, c.completion_rate]));
  const under: number[] = [];
  const over: number[] = [];

  (screenLogs ?? []).forEach((log: { log_date: string; minutes: number }) => {
    const rate = completionByDate.get(log.log_date);
    if (rate === undefined) return;
    if (log.minutes < 150) under.push(rate);
    else if (log.minutes > 240) over.push(rate);
  });

  const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
  return { underGoalAvg: avg(under), overGoalAvg: avg(over) };
}
