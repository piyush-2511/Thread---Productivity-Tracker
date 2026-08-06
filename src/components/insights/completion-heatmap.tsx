"use client";

import { lastNDates } from "@/lib/utils/date-helpers";
import { cn } from "@/lib/utils";
import type { DailyCompletionRow } from "@/lib/queries/insights";

/** GitHub-style heatmap: one cell per day, intensity by completion rate. */
export function CompletionHeatmap({ data, days = 56 }: { data: DailyCompletionRow[]; days?: number }) {
  const dates = lastNDates(days);
  const byDate = new Map(data.map((d) => [d.log_date, d.completion_rate]));

  function intensityClass(rate: number | undefined) {
    if (rate === undefined) return "bg-secondary";
    if (rate === 0) return "bg-secondary";
    if (rate < 40) return "bg-accent/30";
    if (rate < 70) return "bg-accent/60";
    return "bg-success";
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 font-serif text-[15px] font-medium">
        Consistency heatmap <span className="font-mono text-xs font-normal text-muted-foreground">last {days / 7} weeks</span>
      </h2>
      <div className="flex flex-wrap gap-[3px]">
        {dates.map((date) => (
          <div
            key={date}
            title={`${date}: ${byDate.get(date) ?? 0}%`}
            className={cn("h-3.5 w-3.5 rounded-[4px]", intensityClass(byDate.get(date)))}
          />
        ))}
      </div>
    </div>
  );
}
