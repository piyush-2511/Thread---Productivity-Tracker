"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MealCard } from "@/components/diet/meal-card";
import { QuickLogFood } from "@/components/diet/quick-log-food";
import { WeeklyPlanEditor } from "@/components/diet/weekly-plan-editor";
import { NutritionTargetForm } from "@/components/diet/nutrition-target-form";
import { NutritionProgressRing } from "@/components/diet/nutrition-progress-ring";
import { useTodayDiet } from "@/hooks/use-diet";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "today", label: "Today" },
  { key: "plan", label: "Weekly plan" },
  { key: "targets", label: "Targets" },
] as const;

export default function DietPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("today");

  return (
    <>
      <Header eyebrow="Diet" title="Nutrition" sub="Weekly plan, today's meals, and targets." />

      <div className="p-5 md:p-8">
        <div className="mb-4 inline-flex gap-1 rounded-xl bg-secondary p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-lg px-4 py-2 text-[12.5px] font-semibold",
                tab === t.key ? "bg-card shadow-sm" : "text-muted-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "today" && <TodayPanel />}
        {tab === "plan" && <WeeklyPlanEditor />}
        {tab === "targets" && <NutritionTargetForm />}
      </div>
    </>
  );
}

function TodayPanel() {
  const { mealsByType, adHocEntries, totals, targets, loading, isEaten, toggleEaten, quickLogFood } = useTodayDiet();

  if (loading) return <LoadingSkeleton className="h-64 w-full rounded-2xl" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NutritionProgressRing label="kcal" value={totals.calories} target={targets?.target_calories ?? null} unit="" />
        <NutritionProgressRing label="protein" value={totals.protein_g} target={targets?.target_protein_g ?? null} unit="g" />
        <NutritionProgressRing label="carbs" value={totals.carbs_g} target={targets?.target_carbs_g ?? null} unit="g" />
        <NutritionProgressRing label="fat" value={totals.fat_g} target={targets?.target_fat_g ?? null} unit="g" />
      </div>

      <QuickLogFood onLog={quickLogFood} />

      {adHocEntries.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2.5 font-serif text-[15px] font-medium">Quick logged today</h2>
          {adHocEntries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2.5 border-b border-border py-2 text-[13.5px] last:border-none">
              <span className="flex-1">{entry.description}</span>
              <span className="font-mono text-[10.5px] text-muted-foreground">{entry.actual_calories} kcal</span>
            </div>
          ))}
        </div>
      )}

      <MealCard mealType="breakfast" items={mealsByType.breakfast} isEaten={isEaten} onToggle={toggleEaten} />
      <MealCard mealType="lunch" items={mealsByType.lunch} isEaten={isEaten} onToggle={toggleEaten} />
      <MealCard mealType="dinner" items={mealsByType.dinner} isEaten={isEaten} onToggle={toggleEaten} />
      <MealCard mealType="snack" items={mealsByType.snack} isEaten={isEaten} onToggle={toggleEaten} />
    </div>
  );
}
