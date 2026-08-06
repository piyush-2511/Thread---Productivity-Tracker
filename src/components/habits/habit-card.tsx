"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { HabitHeatmap } from "@/components/habits/habit-heatmap";
import { StreakBadge } from "@/components/shared/streak-badge";
import { calculateCurrentStreak } from "@/lib/utils/streak-calculator";
import type { Habit, HabitLog } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

export function HabitCard({
  habit,
  logs,
  isCompletedToday,
  onToggleToday,
}: {
  habit: Habit;
  logs: HabitLog[];
  isCompletedToday: boolean;
  onToggleToday: () => void;
}) {
  const streak = calculateCurrentStreak(logs);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2.5">
        <Checkbox checked={isCompletedToday} onCheckedChange={onToggleToday} />
        <Link href={`/habits/${habit.id}`} className="flex-1">
          <span className={cn("text-[14px] font-medium", isCompletedToday && "text-muted-foreground line-through")}>
            {habit.title}
          </span>
          <span className="ml-2 font-mono text-[10.5px] uppercase text-muted-foreground">{habit.frequency}</span>
        </Link>
        <StreakBadge days={streak} />
      </div>
      <div className="mt-3">
        <HabitHeatmap logs={logs} />
      </div>
    </div>
  );
}
