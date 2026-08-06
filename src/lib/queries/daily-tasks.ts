import { createClient } from "@/lib/supabase/client";
import type { DailyTask, DailyTaskLog } from "@/lib/types/database.types";
import { todayISO } from "@/lib/utils/date-helpers";

export async function getDailyTasks(): Promise<DailyTask[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createDailyTask(title: string): Promise<DailyTask> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("daily_tasks")
    .insert({ title, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Today's completion state for every active daily-checklist item. */
export async function getTodayChecklistLogs(): Promise<DailyTaskLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("daily_task_logs")
    .select("*")
    .eq("log_date", todayISO());

  if (error) throw error;
  return data ?? [];
}

export async function toggleDailyTaskToday(taskId: string, isCompleted: boolean): Promise<DailyTaskLog> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("daily_task_logs")
    .upsert(
      {
        daily_task_id: taskId,
        user_id: user.id,
        log_date: todayISO(),
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      },
      { onConflict: "daily_task_id,log_date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Soft delete — sets is_active=false so past completion history is preserved. */
export async function deleteDailyTask(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("daily_tasks").update({ is_active: false }).eq("id", id);
  if (error) throw error;
}
