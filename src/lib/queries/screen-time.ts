import { createClient } from "@/lib/supabase/client";
import type { ScreenTimeLog } from "@/lib/types/database.types";
import { todayISO, lastNDates } from "@/lib/utils/date-helpers";

/**
 * One overall entry per day (category: null) is the default, quick-log use case.
 * Category-specific breakdowns can be added the same way with a category value.
 */
export async function getTodayScreenTime(): Promise<ScreenTimeLog | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("screen_time_logs")
    .select("*")
    .eq("log_date", todayISO())
    .is("category", null)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function setTodayScreenTime(minutes: number, goalMinutes?: number): Promise<ScreenTimeLog> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await getTodayScreenTime();

  if (existing) {
    const { data, error } = await supabase
      .from("screen_time_logs")
      .update({ minutes, goal_minutes: goalMinutes ?? existing.goal_minutes })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("screen_time_logs")
    .insert({ minutes, goal_minutes: goalMinutes, user_id: user.id, log_date: todayISO(), category: null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** For Insights: screen time across the last N days, used for the completion-rate correlation chart. */
export async function getScreenTimeRange(days = 30): Promise<ScreenTimeLog[]> {
  const supabase = createClient();
  const since = lastNDates(days)[0];

  const { data, error } = await supabase
    .from("screen_time_logs")
    .select("*")
    .gte("log_date", since)
    .is("category", null)
    .order("log_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
