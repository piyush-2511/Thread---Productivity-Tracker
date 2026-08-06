"use client";

import { useCallback, useEffect, useState } from "react";
import type { DailyTask, DailyTaskLog } from "@/lib/types/database.types";
import { getDailyTasks, createDailyTask, getTodayChecklistLogs, toggleDailyTaskToday, deleteDailyTask } from "@/lib/queries/daily-tasks";

/** Powers the "Daily Checklist" card — recurring routine tasks, checked off each day. */
export function useDailyLog() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [todayLogs, setTodayLogs] = useState<DailyTaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [t, logs] = await Promise.all([getDailyTasks(), getTodayChecklistLogs()]);
      setTasks(t);
      setTodayLogs(logs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load daily checklist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isCompletedToday(taskId: string) {
    return todayLogs.find((l) => l.daily_task_id === taskId)?.is_completed ?? false;
  }

  const completedCount = tasks.filter((t) => isCompletedToday(t.id)).length;

  async function addTask(title: string) {
    try {
      const created = await createDailyTask(title);
      setTasks((prev) => [...prev, created]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add checklist item");
    }
  }

  async function toggleToday(taskId: string) {
    const currentlyDone = isCompletedToday(taskId);
    setTodayLogs((prev) => {
      const exists = prev.find((l) => l.daily_task_id === taskId);
      if (exists) return prev.map((l) => (l.daily_task_id === taskId ? { ...l, is_completed: !currentlyDone } : l));
      return [...prev, { id: `temp-${Date.now()}`, daily_task_id: taskId, user_id: "", log_date: "", is_completed: true, completed_at: null }];
    });

    try {
      await toggleDailyTaskToday(taskId, !currentlyDone);
    } catch (e) {
      refresh();
      setError(e instanceof Error ? e.message : "Failed to update checklist item");
    }
  }

  async function removeTask(id: string) {
    const prev = tasks;
    setTasks((cur) => cur.filter((t) => t.id !== id));
    try {
      await deleteDailyTask(id);
    } catch (e) {
      setTasks(prev);
      setError(e instanceof Error ? e.message : "Failed to delete checklist item");
    }
  }

  return { tasks, loading, error, isCompletedToday, completedCount, addTask, toggleToday, removeTask, refresh };
}
