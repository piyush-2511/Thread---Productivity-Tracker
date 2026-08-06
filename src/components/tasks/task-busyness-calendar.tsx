"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUpcomingTaskCounts } from "@/lib/queries/todos";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";

/**
 * A 14-day-ahead overview of task density per day — answers "how busy am I
 * about to get" at a glance, distinct from the todo list itself. Today's
 * quick-add tasks deliberately have no due date (see TodoQuickAdd), so this
 * calendar only reflects tasks explicitly scheduled for a future day via
 * the "Task with date" dialog.
 */
export function TaskBusynessCalendar() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingTaskCounts(14)
      .then(setCounts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton className="h-32 w-full rounded-2xl" />;

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const maxCount = Math.max(1, ...Object.values(counts));

  function intensity(count: number) {
    if (count === 0) return "bg-secondary text-muted-foreground";
    const ratio = count / maxCount;
    if (ratio > 0.66) return "bg-destructive/80 text-white";
    if (ratio > 0.33) return "bg-accent text-accent-foreground";
    return "bg-success/60 text-success-foreground";
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-[15px] font-medium">Next 14 days</h2>
        <Link href="/tasks" className="text-[11px] text-muted-foreground underline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const iso = day.toISOString().split("T")[0];
          const count = counts[iso] ?? 0;
          return (
            <div
              key={iso}
              title={`${day.toDateString()}: ${count} task${count === 1 ? "" : "s"}`}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-lg font-mono text-[10px]",
                intensity(count)
              )}
            >
              <span className="opacity-70">{day.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
              <span className="font-semibold">{day.getDate()}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-[11px] text-muted-foreground">
        Darker = busier. Only counts tasks with a due date.
      </p>
    </div>
  );
}
