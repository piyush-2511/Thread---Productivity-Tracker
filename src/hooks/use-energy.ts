"use client";

import { useCallback, useEffect, useState } from "react";
import type { EnergyLog } from "@/lib/types/database.types";
import { getTodayEnergyLogs, logEnergy } from "@/lib/queries/energy";

export function useEnergy() {
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setLogs(await getTodayEnergyLogs());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load energy logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Most recent check-in today, used to highlight the active pill
  const currentLevel = logs.length > 0 ? logs[logs.length - 1].energy_level : null;

  async function checkIn(level: "low" | "medium" | "high") {
    const optimistic: EnergyLog = {
      id: `temp-${Date.now()}`,
      user_id: "",
      energy_level: level,
      logged_at: new Date().toISOString(),
      log_date: "",
    };
    setLogs((prev) => [...prev, optimistic]);

    try {
      const created = await logEnergy(level);
      setLogs((prev) => prev.map((l) => (l.id === optimistic.id ? created : l)));
    } catch (e) {
      setLogs((prev) => prev.filter((l) => l.id !== optimistic.id));
      setError(e instanceof Error ? e.message : "Failed to log energy");
    }
  }

  return { logs, currentLevel, loading, error, checkIn, refresh };
}
