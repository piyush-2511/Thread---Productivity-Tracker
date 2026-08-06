import { createClient } from "@/lib/supabase/client";
import type { Todo } from "@/lib/types/database.types";

/** All queries here run in the browser client and rely on RLS to scope rows to the current user. */

export async function getTodos(): Promise<Todo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createTodo(input: {
  title: string;
  description?: string;
  tag?: string;
  due_date?: string;
}): Promise<Todo> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("todos")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleTodoComplete(id: string, isCompleted: boolean): Promise<Todo> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("todos")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTodo(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  const supabase = createClient();
  const { data, error } = await supabase.from("todos").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

/** Counts open (incomplete) todos per due date over the next N days — powers the busyness calendar. */
export async function getUpcomingTaskCounts(days = 14): Promise<Record<string, number>> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const future = new Date();
  future.setDate(future.getDate() + days);
  const futureISO = future.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("todos")
    .select("due_date")
    .eq("is_completed", false)
    .gte("due_date", today)
    .lte("due_date", futureISO);

  if (error) throw error;

  const counts: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    if (!row.due_date) return;
    counts[row.due_date] = (counts[row.due_date] ?? 0) + 1;
  });
  return counts;
}
