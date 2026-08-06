import { createClient } from "@/lib/supabase/client";
import type { Habit, HabitLog } from "@/lib/types/database.types";
import { todayISO, lastNDates } from "@/lib/utils/date-helpers";

export async function getHabits(): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createHabit(input: {
  title: string;
  description?: string;
  frequency?: "daily" | "weekly";
  stacked_on_habit_id?: string;
}): Promise<Habit> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("habits")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Fetches logs for a single habit over the last N days (for the mini heatmap). */
export async function getHabitLogs(habitId: string, days = 30): Promise<HabitLog[]> {
  const supabase = createClient();
  const since = lastNDates(days)[0];

  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .gte("log_date", since)
    .order("log_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Fetches today's log entry for every active habit — used to render "Habits due today". */
export async function getTodayHabitLogs(): Promise<HabitLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("log_date", todayISO());

  if (error) throw error;
  return data ?? [];
}

/** Marks a habit complete (or not) for today. Upserts so re-toggling doesn't create duplicates. */
export async function toggleHabitToday(habitId: string, isCompleted: boolean): Promise<HabitLog> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(
      { habit_id: habitId, user_id: user.id, log_date: todayISO(), is_completed: isCompleted },
      { onConflict: "habit_id,log_date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHabit(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("habits").update({ is_active: false }).eq("id", id);
  if (error) throw error;
}
