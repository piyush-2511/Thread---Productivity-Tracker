"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { DietPlanMeal } from "@/lib/types/database.types";

const MEAL_LABELS: Record<DietPlanMeal["meal_type"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export function MealCard({
  mealType,
  items,
  isEaten,
  onToggle,
}: {
  mealType: DietPlanMeal["meal_type"];
  items: DietPlanMeal[];
  isEaten: (id: string) => boolean;
  onToggle: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2.5 font-serif text-[15px] font-medium">{MEAL_LABELS[mealType]}</h2>
      {items.map((item) => {
        const eaten = isEaten(item.id);
        return (
          <div key={item.id} className="flex items-center gap-2.5 border-b border-border py-2 text-[13.5px] last:border-none">
            <Checkbox checked={eaten} onCheckedChange={() => onToggle(item.id)} />
            <span className={cn("flex-1", eaten && "text-muted-foreground line-through")}>{item.food_name}</span>
            <span className="font-mono text-[10.5px] text-muted-foreground">{item.calories} kcal</span>
          </div>
        );
      })}
    </div>
  );
}
