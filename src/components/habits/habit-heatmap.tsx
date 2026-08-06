import { lastNDates } from "@/lib/utils/date-helpers";
import { cn } from "@/lib/utils";
import type { HabitLog } from "@/lib/types/database.types";

/** Compact 7-day heatmap strip shown on each habit card. */
export function HabitHeatmap({ logs, days = 7 }: { logs: HabitLog[]; days?: number }) {
  const dates = lastNDates(days);

  return (
    <div className="flex gap-1">
      {dates.map((date) => {
        const log = logs.find((l) => l.log_date === date);
        const state = log?.is_completed ? "done" : log?.is_freeze ? "freeze" : "empty";
        return (
          <div
            key={date}
            title={date}
            className={cn(
              "h-4 w-4 rounded-[4px]",
              state === "done" && "bg-success",
              state === "freeze" && "bg-accent/50",
              state === "empty" && "bg-secondary"
            )}
          />
        );
      })}
    </div>
  );
}
