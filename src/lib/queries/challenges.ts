import { createClient } from "@/lib/supabase/client";
import type { Challenge, ChallengeTask, ChallengeLog } from "@/lib/types/database.types";
import { todayISO } from "@/lib/utils/date-helpers";

export async function getActiveChallenges(): Promise<Challenge[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("challenges").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function createChallenge(input: {
  title: string;
  description?: string;
  start_date?: string;
  duration_days: number;
  taskTitles: string[]; // daily sub-tasks defined at creation time
}): Promise<Challenge> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: challenge, error } = await supabase
    .from("challenges")
    .insert({
      title: input.title,
      description: input.description,
      start_date: input.start_date ?? todayISO(),
      duration_days: input.duration_days,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  if (input.taskTitles.length > 0) {
    const { error: taskError } = await supabase
      .from("challenge_tasks")
      .insert(input.taskTitles.map((title) => ({ challenge_id: challenge.id, title })));
    if (taskError) throw taskError;
  }

  return challenge;
}

export async function getChallengeTasks(challengeId: string): Promise<ChallengeTask[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("challenge_tasks")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getChallengeLogs(challengeId: string): Promise<ChallengeLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("challenge_logs")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("log_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Today's logs across ALL active challenges — used for the Today screen progress card. */
export async function getTodayChallengeLogs(): Promise<ChallengeLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("challenge_logs").select("*").eq("log_date", todayISO());
  if (error) throw error;
  return data ?? [];
}

export async function toggleChallengeTaskToday(
  challengeId: string,
  challengeTaskId: string,
  isCompleted: boolean,
  note?: string
): Promise<ChallengeLog> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("challenge_logs")
    .insert({
      challenge_id: challengeId,
      challenge_task_id: challengeTaskId,
      user_id: user.id,
      log_date: todayISO(),
      is_completed: isCompleted,
      note,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function endChallenge(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("challenges").update({ is_active: false }).eq("id", id);
  if (error) throw error;
}
