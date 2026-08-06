"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNutritionTargets } from "@/hooks/use-diet";

export function NutritionTargetForm() {
  const { targets, loading, saving, save } = useNutritionTargets();
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    if (!targets) return;
    setCalories(String(targets.target_calories ?? ""));
    setProtein(String(targets.target_protein_g ?? ""));
    setCarbs(String(targets.target_carbs_g ?? ""));
    setFat(String(targets.target_fat_g ?? ""));
  }, [targets]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await save({
      target_calories: Number(calories) || undefined,
      target_protein_g: Number(protein) || undefined,
      target_carbs_g: Number(carbs) || undefined,
      target_fat_g: Number(fat) || undefined,
    });
  }

  if (loading) return null;

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="font-serif text-[15px] font-medium">Daily targets</h2>

      <Field label="Calories" value={calories} onChange={setCalories} unit="kcal" />
      <Field label="Protein" value={protein} onChange={setProtein} unit="g" />
      <Field label="Carbs" value={carbs} onChange={setCarbs} unit="g" />
      <Field label="Fat" value={fat} onChange={setFat} unit="g" />

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Saving…" : "Save targets"}
      </Button>
    </form>
  );
}

function Field({ label, value, onChange, unit }: { label: string; value: string; onChange: (v: string) => void; unit: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
