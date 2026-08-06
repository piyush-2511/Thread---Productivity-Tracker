"use client";

import { useCallback, useEffect, useState } from "react";
import type { DietPlanMeal, DietLog, NutritionTarget } from "@/lib/types/database.types";
import {
  currentDayOfWeek,
  getPlanForDay,
  getFullWeekPlan,
  getTodayDietLogs,
  logMealEaten,
  getNutritionTargets,
  saveNutritionTargets,
  addPlanMeal,
  deletePlanMeal,
  sumEatenMacros,
  getAdHocEntries,
} from "@/lib/queries/diet";

/** Powers the Diet > Today view and the Today screen's diet card. */
export function useTodayDiet() {
  const [meals, setMeals] = useState<DietPlanMeal[]>([]);
  const [logs, setLogs] = useState<DietLog[]>([]);
  const [targets, setTargets] = useState<NutritionTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [m, l, t] = await Promise.all([
        getPlanForDay(currentDayOfWeek()),
        getTodayDietLogs(),
        getNutritionTargets(),
      ]);
      setMeals(m);
      setLogs(l);
      setTargets(t);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load today's diet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isEaten(mealId: string) {
    return logs.some((l) => l.diet_plan_meal_id === mealId && l.is_eaten);
  }

  async function toggleEaten(mealId: string) {
    const currentlyEaten = isEaten(mealId);
    setLogs((prev) => {
      const exists = prev.find((l) => l.diet_plan_meal_id === mealId);
      if (exists) return prev.map((l) => (l.diet_plan_meal_id === mealId ? { ...l, is_eaten: !currentlyEaten } : l));
      return [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          user_id: "",
          diet_plan_meal_id: mealId,
          log_date: "",
          is_eaten: true,
          actual_calories: null,
          actual_protein_g: null,
          actual_carbs_g: null,
          actual_fat_g: null,
          logged_at: "",
        },
      ];
    });

    try {
      await logMealEaten(mealId, !currentlyEaten);
    } catch (e) {
      refresh();
      setError(e instanceof Error ? e.message : "Failed to log meal");
    }
  }

  const totals = sumEatenMacros(logs, meals);
  const adHocEntries = getAdHocEntries(logs);
  const mealsByType = {
    breakfast: meals.filter((m) => m.meal_type === "breakfast"),
    lunch: meals.filter((m) => m.meal_type === "lunch"),
    dinner: meals.filter((m) => m.meal_type === "dinner"),
    snack: meals.filter((m) => m.meal_type === "snack"),
  };

  /** AI-estimated quick log — calls /api/diet/estimate, which is the only place Gemini gets touched for this. */
  async function quickLogFood(description: string, mealType?: "breakfast" | "lunch" | "dinner" | "snack") {
    const res = await fetch("/api/diet/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, meal_type: mealType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to log food");
    await refresh();
    return data.nutrition as { calories: number; protein_g: number; carbs_g: number; fat_g: number };
  }

  return {
    meals,
    mealsByType,
    logs,
    adHocEntries,
    targets,
    totals,
    loading,
    error,
    isEaten,
    toggleEaten,
    quickLogFood,
    refresh,
  };
}

/** Powers the Diet > Weekly Plan builder. */
export function useWeeklyPlan() {
  const [plan, setPlan] = useState<DietPlanMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setPlan(await getFullWeekPlan());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load weekly plan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function mealsForDay(dayOfWeek: number) {
    return plan.filter((m) => m.day_of_week === dayOfWeek);
  }

  async function addMeal(input: Parameters<typeof addPlanMeal>[0]) {
    try {
      const created = await addPlanMeal(input);
      setPlan((prev) => [...prev, created]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add meal");
    }
  }

  async function removeMeal(id: string) {
    const prev = plan;
    setPlan((cur) => cur.filter((m) => m.id !== id));
    try {
      await deletePlanMeal(id);
    } catch (e) {
      setPlan(prev);
      setError(e instanceof Error ? e.message : "Failed to remove meal");
    }
  }

  return { plan, loading, error, mealsForDay, addMeal, removeMeal, refresh };
}

/** Powers the Diet > Targets form. */
export function useNutritionTargets() {
  const [targets, setTargets] = useState<NutritionTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNutritionTargets().then((t) => {
      setTargets(t);
      setLoading(false);
    });
  }, []);

  async function save(input: Parameters<typeof saveNutritionTargets>[0]) {
    setSaving(true);
    try {
      const updated = await saveNutritionTargets(input);
      setTargets(updated);
    } finally {
      setSaving(false);
    }
  }

  return { targets, loading, saving, save };
}
