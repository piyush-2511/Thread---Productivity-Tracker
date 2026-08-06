"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useTodayDiet } from "@/hooks/use-diet";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

/** Compact version of today's planned meals, shown on the Today screen. */
export function DietTodayCard() {
  const { meals, adHocEntries, totals, targets, loading, isEaten, toggleEaten } = useTodayDiet();
  const eatenCount = meals.filter((m) => isEaten(m.id)).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's meals</CardTitle>
        <span className="font-mono text-xs text-muted-foreground">
          {eatenCount}/{meals.length}
        </span>
      </CardHeader>
      <CardContent>
        {loading && <LoadingSkeleton className="h-20 w-full" />}

        {!loading && meals.length === 0 && adHocEntries.length === 0 && (
          <EmptyState message="No meals planned for today — set up your weekly plan in Diet." />
        )}

        {!loading &&
          meals.map((meal) => {
            const eaten = isEaten(meal.id);
            return (
              <div key={meal.id} className="flex items-center gap-2.5 border-b border-border py-2 text-[13.5px] last:border-none">
                <Checkbox checked={eaten} onCheckedChange={() => toggleEaten(meal.id)} />
                <span className={cn("flex-1", eaten && "text-muted-foreground line-through")}>{meal.food_name}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground">{meal.calories} kcal</span>
              </div>
            );
          })}

        {!loading &&
          adHocEntries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2.5 border-b border-border py-2 text-[13.5px] last:border-none">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="flex-1">{entry.description}</span>
              <span className="font-mono text-[10.5px] text-muted-foreground">{entry.actual_calories} kcal</span>
            </div>
          ))}

        {!loading && (meals.length > 0 || adHocEntries.length > 0) && (
          <>
            <div className="mt-2.5 text-[11.5px] text-muted-foreground">
              {Math.round(totals.calories)} / {targets?.target_calories ?? "—"} kcal logged
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-success"
                style={{
                  width: `${targets?.target_calories ? Math.min(100, Math.round((totals.calories / targets.target_calories) * 100)) : 0}%`,
                }}
              />
            </div>
          </>
        )}

        <Link
          href="/diet"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2 text-[12px] font-medium text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Log food not in your plan
        </Link>
      </CardContent>
    </Card>
  );
}
