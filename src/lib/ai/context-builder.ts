/**
 * SERVER-ONLY. Builds a compact, recent-data summary for the AI Coach prompt.
 * Deliberately windowed to the last 7-14 days rather than full history —
 * keeps token usage (and therefore cost) predictable, and recent data is
 * what's actually relevant to "how am I doing lately" questions.
 *
 * All queries here run through the Supabase SERVER client, which is scoped
 * to the authenticated user via RLS — no explicit user_id filtering needed,
 * but every table here still has "auth.uid() = user_id" policies as a
 * second line of defense.
 */
import { createClient } from "@/lib/supabase/server";
import { calculateCurrentStreak } from "@/lib/utils/streak-calculator";
import { lastNDates, todayISO } from "@/lib/utils/date-helpers";

export async function buildUserContext(): Promise<string> {
  const supabase = await createClient();
  const since7 = lastNDates(7)[0];
  const since14 = lastNDates(14)[0];

  const [
    completionRes,
    habitsRes,
    habitLogsRes,
    todosRes,
    challengesRes,
    energyRes,
    screenTimeRes,
    nutritionTargetRes,
    nutritionRes,
    thoughtsRes,
  ] = await Promise.all([
    supabase.from("daily_completion_summary").select("*").gte("log_date", since7),
    supabase.from("habits").select("*").eq("is_active", true),
    supabase.from("habit_logs").select("*").gte("log_date", since14),
    supabase.from("todos").select("title, is_completed, due_date").eq("is_completed", false),
    supabase.from("challenges").select("*").eq("is_active", true),
    supabase.from("energy_logs").select("energy_level, logged_at").gte("log_date", since7),
    supabase.from("screen_time_logs").select("log_date, minutes").gte("log_date", since7).is("category", null),
    supabase.from("nutrition_targets").select("*").maybeSingle(),
    supabase.from("daily_nutrition_summary").select("*").gte("log_date", since7),
    supabase.from("thoughts").select("content, entry_date").order("entry_date", { ascending: false }).limit(3),
  ]);

  const lines: string[] = [];

  // Completion
  const completion = completionRes.data ?? [];
  if (completion.length > 0) {
    const avg = Math.round(completion.reduce((s, c) => s + (c.completion_rate ?? 0), 0) / completion.length);
    lines.push(`Task/habit completion rate, last 7 days: ${avg}% average.`);
  }

  // Habits + streaks
  const habits = habitsRes.data ?? [];
  const habitLogs = habitLogsRes.data ?? [];
  if (habits.length > 0) {
    const habitLines = habits.map((h) => {
      const logs = habitLogs.filter((l) => l.habit_id === h.id);
      const streak = calculateCurrentStreak(logs);
      return `- ${h.title} (${h.frequency}): current streak ${streak} day(s)`;
    });
    lines.push(`Active habits:\n${habitLines.join("\n")}`);
  }

  // Todos
  const openTodos = todosRes.data ?? [];
  const overdue = openTodos.filter((t) => t.due_date && t.due_date < todayISO());
  lines.push(`Open todos: ${openTodos.length} total, ${overdue.length} overdue.`);

  // Challenges
  const challenges = challengesRes.data ?? [];
  if (challenges.length > 0) {
    const challengeLines = challenges.map((c) => {
      const start = new Date(`${c.start_date}T00:00:00`);
      const today = new Date(`${todayISO()}T00:00:00`);
      const day = Math.min(Math.max(Math.floor((today.getTime() - start.getTime()) / 86400000) + 1, 1), c.duration_days);
      return `- ${c.title}: day ${day}/${c.duration_days}`;
    });
    lines.push(`Active challenges:\n${challengeLines.join("\n")}`);
  }

  // Energy by time of day
  const energyLogs = energyRes.data ?? [];
  if (energyLogs.length > 0) {
    const score = { low: 1, medium: 2, high: 3 } as const;
    const buckets: Record<string, number[]> = { Morning: [], Noon: [], Afternoon: [], Evening: [] };
    energyLogs.forEach((log) => {
      const hour = new Date(log.logged_at).getHours();
      const bucket = hour < 11 ? "Morning" : hour < 14 ? "Noon" : hour < 18 ? "Afternoon" : "Evening";
      buckets[bucket].push(score[log.energy_level as "low" | "medium" | "high"]);
    });
    const bucketLines = Object.entries(buckets)
      .filter(([, scores]) => scores.length > 0)
      .map(([bucket, scores]) => `${bucket}: avg ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}/3`);
    lines.push(`Energy pattern, last 7 days (1=low, 3=high):\n${bucketLines.join(", ")}`);
  }

  // Screen time
  const screenLogs = screenTimeRes.data ?? [];
  if (screenLogs.length > 0) {
    const avgMinutes = Math.round(screenLogs.reduce((s, l) => s + l.minutes, 0) / screenLogs.length);
    lines.push(`Screen time, last 7 days: avg ${Math.round(avgMinutes / 60)}h ${avgMinutes % 60}m/day.`);
  }

  // Nutrition
  const targets = nutritionTargetRes.data;
  const nutrition = nutritionRes.data ?? [];
  if (targets && nutrition.length > 0) {
    const avgCalories = Math.round(nutrition.reduce((s, n) => s + (n.total_calories ?? 0), 0) / nutrition.length);
    const avgProtein = Math.round(nutrition.reduce((s, n) => s + (n.total_protein_g ?? 0), 0) / nutrition.length);
    lines.push(
      `Nutrition, last 7 days avg: ${avgCalories} kcal (target ${targets.target_calories ?? "not set"}), ` +
        `${avgProtein}g protein (target ${targets.target_protein_g ?? "not set"}).`
    );
  }

  // Recent thoughts — light personal context, not for quoting back verbatim
  const thoughts = thoughtsRes.data ?? [];
  if (thoughts.length > 0) {
    lines.push(`Recent journal entries (for tone/context only):\n${thoughts.map((t) => `- "${t.content}"`).join("\n")}`);
  }

  if (lines.length === 0) {
    return "The user hasn't logged any data yet. Encourage them to start with one small thing today.";
  }

  return lines.join("\n\n");
}
