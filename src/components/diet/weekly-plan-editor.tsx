"use client";

import { useState } from "react";
import { useWeeklyPlan } from "@/hooks/use-diet";
import { MealForm } from "@/components/diet/meal-form";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { X } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function WeeklyPlanEditor() {
  const { loading, mealsForDay, addMeal, removeMeal } = useWeeklyPlan();
  const [openDay, setOpenDay] = useState<number | null>(null);

  if (loading) return <LoadingSkeleton className="h-64 w-full rounded-2xl" />;

  return (
    <div className="space-y-3">
      {DAYS.map((dayName, dayIndex) => {
        const meals = mealsForDay(dayIndex);
        return (
          <div key={dayIndex} className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-serif text-[15px] font-medium">{dayName}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenDay(openDay === dayIndex ? null : dayIndex)}
              >
                {openDay === dayIndex ? "Close" : "+ Add meal"}
              </Button>
            </div>

            {meals.length === 0 && openDay !== dayIndex && (
              <p className="text-xs text-muted-foreground">No meals planned yet.</p>
            )}

            {meals.map((meal) => (
              <div key={meal.id} className="group flex items-center gap-2.5 border-b border-border py-1.5 text-[13px] last:border-none">
                <span className="w-16 shrink-0 font-mono text-[10px] uppercase text-muted-foreground">{meal.meal_type}</span>
                <span className="flex-1">{meal.food_name}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground">{meal.calories} kcal</span>
                <button
                  onClick={() => removeMeal(meal.id)}
                  className="opacity-0 group-hover:opacity-100"
                  aria-label="Remove meal"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}

            {openDay === dayIndex && (
              <div className="mt-3 border-t border-border pt-3">
                <MealForm
                  dayOfWeek={dayIndex}
                  onSubmit={async (input) => {
                    await addMeal(input);
                  }}
                  onCancel={() => setOpenDay(null)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
