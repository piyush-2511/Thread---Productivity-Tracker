"use client";

import { useEffect, useState } from "react";
import {
  getDailyCompletionSummary,
  getDailyNutritionSummary,
  getHabitComparison,
  getEnergyByTimeOfDay,
  getScreenTimeCorrelation,
  type DailyCompletionRow,
  type DailyNutritionRow,
} from "@/lib/queries/insights";
import { getNutritionTargets } from "@/lib/queries/diet";
import type { Habit } from "@/lib/types/database.types";
import { calculateBestStreak } from "@/lib/utils/streak-calculator";
import { createClient } from "@/lib/supabase/client";
import { lastNDates } from "@/lib/utils/date-helpers";

export function useInsights(days = 30) {
  const [completion, setCompletion] = useState<DailyCompletionRow[]>([]);
  const [nutrition, setNutrition] = useState<DailyNutritionRow[]>([]);
  const [habitComparison, setHabitComparison] = useState<{ habit: Habit; rate: number }[]>([]);
  const [energyByTime, setEnergyByTime] = useState<{ bucket: string; avgScore: number }[]>([]);
  const [screenTimeCorrelation, setScreenTimeCorrelation] = useState({ underGoalAvg: 0, overGoalAvg: 0 });
  const [nutritionTargetCalories, setNutritionTargetCalories] = useState<number | null>(null);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [c, n, hc, ebt, stc, targets] = await Promise.all([
          getDailyCompletionSummary(days),
          getDailyNutritionSummary(days),
          getHabitComparison(days),
          getEnergyByTimeOfDay(days),
          getScreenTimeCorrelation(days),
          getNutritionTargets(),
        ]);
        setCompletion(c);
        setNutrition(n);
        setHabitComparison(hc);
        setEnergyByTime(ebt);
        setScreenTimeCorrelation(stc);
        setNutritionTargetCalories(targets?.target_calories ?? null);

        // Best streak across all habits, computed from the same habit_logs window
        const supabase = createClient();
        const since = lastNDates(days)[0];
        const { data: allLogs } = await supabase.from("habit_logs").select("*").gte("log_date", since);
        const byHabit = new Map<string, typeof allLogs>();
        (allLogs ?? []).forEach((log: { habit_id: string }) => {
          const arr = byHabit.get(log.habit_id) ?? [];
          arr.push(log as never);
          byHabit.set(log.habit_id, arr);
        });
        let best = 0;
        byHabit.forEach((logs) => {
          best = Math.max(best, calculateBestStreak(logs as never));
        });
        setBestStreak(best);

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load insights");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

  const avgCompletion = completion.length
    ? Math.round(completion.reduce((sum, c) => sum + c.completion_rate, 0) / completion.length)
    : 0;

  return {
    completion,
    nutrition,
    habitComparison,
    energyByTime,
    screenTimeCorrelation,
    nutritionTargetCalories,
    avgCompletion,
    bestStreak,
    loading,
    error,
  };
}
