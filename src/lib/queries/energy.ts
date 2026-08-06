import { createClient } from "@/lib/supabase/client";
import type { EnergyLog } from "@/lib/types/database.types";
import { todayISO, lastNDates } from "@/lib/utils/date-helpers";

/** Energy is check-in based — a user can log multiple times a day, so this always inserts. */
export async function logEnergy(level: "low" | "medium" | "high"): Promise<EnergyLog> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("energy_logs")
    .insert({ energy_level: level, user_id: user.id, log_date: todayISO() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTodayEnergyLogs(): Promise<EnergyLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("energy_logs")
    .select("*")
    .eq("log_date", todayISO())
    .order("logged_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** For Insights: energy logs across the last N days, used to build the energy-by-time-of-day chart. */
export async function getEnergyLogsRange(days = 30): Promise<EnergyLog[]> {
  const supabase = createClient();
  const since = lastNDates(days)[0];

  const { data, error } = await supabase
    .from("energy_logs")
    .select("*")
    .gte("log_date", since)
    .order("logged_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
