"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

/**
 * Free-text food logging with AI-estimated nutrition — e.g. type "500g chana"
 * or "2 eggs" and get calories/protein/carbs/fat back automatically, without
 * needing the food to exist in the weekly plan first.
 */
export function QuickLogFood({
  onLog,
}: {
  onLog: (description: string, mealType?: (typeof MEAL_TYPES)[number]) => Promise<{ calories: number; protein_g: number; carbs_g: number; fat_g: number }>;
}) {
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>("snack");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ description: string; nutrition: { calories: number; protein_g: number; carbs_g: number; fat_g: number } } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || loading) return;

    setLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const nutrition = await onLog(description.trim(), mealType);
      setLastResult({ description: description.trim(), nutrition });
      setDescription("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to estimate nutrition");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-1 flex items-center gap-1.5 font-serif text-[15px] font-medium">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        Quick log
      </h2>
      <p className="mb-3 text-[11.5px] text-muted-foreground">
        Describe what you ate — nutrition is estimated automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='e.g. "500g chana" or "2 eggs"'
          disabled={loading}
          className="w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-[13.5px] outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />

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

        <Button type="submit" className="w-full" disabled={loading || !description.trim()}>
          {loading ? "Estimating…" : "Log it"}
        </Button>
      </form>

      {error && <p className="mt-2 text-[11.5px] text-destructive">{error}</p>}

      {lastResult && (
        <div className="mt-3 rounded-xl bg-secondary p-3 text-[12px]">
          <p className="mb-1 font-medium">"{lastResult.description}" logged</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {lastResult.nutrition.calories} kcal · {lastResult.nutrition.protein_g}g protein ·{" "}
            {lastResult.nutrition.carbs_g}g carbs · {lastResult.nutrition.fat_g}g fat
          </p>
        </div>
      )}
    </div>
  );
}
