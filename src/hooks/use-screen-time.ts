"use client";

import { useCallback, useEffect, useState } from "react";
import { getTodayScreenTime, setTodayScreenTime } from "@/lib/queries/screen-time";

export function useScreenTime() {
  const [minutes, setMinutes] = useState<number | null>(null);
  const [goalMinutes, setGoalMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const log = await getTodayScreenTime();
      setMinutes(log?.minutes ?? null);
      setGoalMinutes(log?.goal_minutes ?? 180); // default 3h goal until the user sets one
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load screen time");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function save(newMinutes: number, newGoal?: number) {
    setSaving(true);
    setMinutes(newMinutes);
    try {
      const updated = await setTodayScreenTime(newMinutes, newGoal ?? goalMinutes ?? undefined);
      setMinutes(updated.minutes);
      setGoalMinutes(updated.goal_minutes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save screen time");
      refresh();
    } finally {
      setSaving(false);
    }
  }

  const percentOfGoal = goalMinutes && minutes !== null ? Math.min(100, Math.round((minutes / goalMinutes) * 100)) : 0;

  return { minutes, goalMinutes, percentOfGoal, loading, saving, error, save };
}
