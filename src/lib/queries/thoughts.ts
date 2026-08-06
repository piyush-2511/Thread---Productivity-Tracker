import { createClient } from "@/lib/supabase/client";
import type { Thought } from "@/lib/types/database.types";
import { todayISO } from "@/lib/utils/date-helpers";

export async function getThoughts(filter?: {
  tag?: "mood" | "quote" | "insight";
  pinnedOnly?: boolean;
}): Promise<Thought[]> {
  const supabase = createClient();
  let query = supabase.from("thoughts").select("*").order("entry_date", { ascending: false });

  if (filter?.tag) query = query.eq("tag", filter.tag);
  if (filter?.pinnedOnly) query = query.eq("is_pinned", true);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** For "on this day" resurfacing — entries from this month/day in previous years. */
export async function getOnThisDayThoughts(): Promise<Thought[]> {
  const supabase = createClient();
  const today = new Date();
  const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("thoughts")
    .select("*")
    .neq("entry_date", todayISO())
    .order("entry_date", { ascending: false });

  if (error) throw error;
  // Filter client-side for matching month-day, since Postgres date-part filtering
  // needs a raw SQL function; fine at this data scale for a personal app.
  return (data ?? []).filter((t) => t.entry_date.slice(5) === monthDay);
}

export async function getTodayThought(): Promise<Thought | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("thoughts").select("*").eq("entry_date", todayISO()).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertTodayThought(content: string, tag?: "mood" | "quote" | "insight"): Promise<Thought> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await getTodayThought();

  if (existing) {
    const { data, error } = await supabase
      .from("thoughts")
      .update({ content, tag })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("thoughts")
    .insert({ content, tag, user_id: user.id, entry_date: todayISO() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function togglePinThought(id: string, isPinned: boolean): Promise<Thought> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("thoughts")
    .update({ is_pinned: isPinned })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
