"use client";

import { useCallback, useEffect, useState } from "react";
import type { Habit, HabitLog } from "@/lib/types/database.types";
import { getHabits, createHabit, getTodayHabitLogs, toggleHabitToday, deleteHabit } from "@/lib/queries/habits";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [h, logs] = await Promise.all([getHabits(), getTodayHabitLogs()]);
      setHabits(h);
      setTodayLogs(logs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isCompletedToday(habitId: string) {
    return todayLogs.find((l) => l.habit_id === habitId)?.is_completed ?? false;
  }

  async function addHabit(input: { title: string; frequency?: "daily" | "weekly"; description?: string }) {
    try {
      const created = await createHabit(input);
      setHabits((prev) => [created, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add habit");
    }
  }

  async function toggleToday(habitId: string) {
    const currentlyDone = isCompletedToday(habitId);
    // optimistic update
    setTodayLogs((prev) => {
      const exists = prev.find((l) => l.habit_id === habitId);
      if (exists) return prev.map((l) => (l.habit_id === habitId ? { ...l, is_completed: !currentlyDone } : l));
      return [...prev, { id: `temp-${Date.now()}`, habit_id: habitId, user_id: "", log_date: "", is_completed: true, is_freeze: false, note: null, created_at: "" }];
    });

    try {
      await toggleHabitToday(habitId, !currentlyDone);
    } catch (e) {
      refresh();
      setError(e instanceof Error ? e.message : "Failed to update habit");
    }
  }

  async function removeHabit(id: string) {
    const prev = habits;
    setHabits((cur) => cur.filter((h) => h.id !== id));
    try {
      await deleteHabit(id);
    } catch (e) {
      setHabits(prev);
      setError(e instanceof Error ? e.message : "Failed to delete habit");
    }
  }

  return { habits, loading, error, isCompletedToday, addHabit, toggleToday, removeHabit, refresh };
}
