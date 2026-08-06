"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEnergy } from "@/hooks/use-energy";
import { cn } from "@/lib/utils";

const LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Med" },
  { value: "high", label: "High" },
] as const;

export function EnergyCheckin() {
  const { currentLevel, loading, checkIn } = useEnergy();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1.5">
          {LEVELS.map(({ value, label }) => (
            <button
              key={value}
              disabled={loading}
              onClick={() => checkIn(value)}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-xs font-semibold transition-colors",
                currentLevel === value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-input text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {currentLevel ? "Tap again anytime energy shifts today." : "Log how you're feeling right now."}
        </p>
      </CardContent>
    </Card>
  );
}
