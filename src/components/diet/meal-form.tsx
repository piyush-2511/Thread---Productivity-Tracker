"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export function MealForm({
  dayOfWeek,
  onSubmit,
  onCancel,
}: {
  dayOfWeek: number;
  onSubmit: (input: {
    day_of_week: number;
    meal_type: (typeof MEAL_TYPES)[number];
    food_name: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  }) => void;
  onCancel?: () => void;
}) {
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>("breakfast");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!foodName.trim()) return;
    onSubmit({
      day_of_week: dayOfWeek,
      meal_type: mealType,
      food_name: foodName.trim(),
      calories: Number(calories) || 0,
      protein_g: Number(protein) || 0,
      carbs_g: Number(carbs) || 0,
      fat_g: Number(fat) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1.5">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMealType(t)}
            className={`flex-1 rounded-lg border py-1.5 text-[11px] font-medium capitalize ${
              mealType === t ? "border-accent bg-accent text-accent-foreground" : "border-input text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Input placeholder="Food name, e.g. Paneer bowl" value={foodName} onChange={(e) => setFoodName(e.target.value)} required autoFocus />

      <div className="grid grid-cols-4 gap-2">
        <Input placeholder="kcal" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
        <Input placeholder="protein g" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} />
        <Input placeholder="carbs g" type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
        <Input placeholder="fat g" type="number" value={fat} onChange={(e) => setFat(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Add meal</Button>
      </div>
    </form>
  );
}
