"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useDailyLog } from "@/hooks/use-daily-log";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * Routine ≠ Habit:
 * - Routine (this card) is a lightweight daily checklist — quick things you want
 *   to do every day, tracked only as done/not-done today. No streaks, no heatmap.
 * - Habit (Habits tab) is for things you want deeper tracking on — streaks,
 *   7/30-day heatmaps, daily-or-weekly frequency, and it shows up in Insights'
 *   habit comparison chart.
 * Use Routine for "drink water, no phone before 9am" type items; use Habits
 * when you actually want to see a streak and hold yourself accountable to it.
 */
export function DailyChecklist() {
  const { tasks, loading, isCompletedToday, completedCount, addTask, toggleToday, removeTask } = useDailyLog();
  const [newTitle, setNewTitle] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTask(newTitle.trim());
    setNewTitle("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routine</CardTitle>
        <span className="font-mono text-xs text-muted-foreground">
          {completedCount}/{tasks.length}
        </span>
      </CardHeader>
      <CardContent>
        {loading && <LoadingSkeleton className="h-24 w-full" />}

        {!loading && tasks.length === 0 && (
          <EmptyState message="No routine tasks yet — add the small things you want to do every day." />
        )}

        {!loading &&
          tasks.map((task) => {
            const done = isCompletedToday(task.id);
            return (
              <div
                key={task.id}
                className="group flex items-center gap-2.5 border-b border-border py-2 text-[13.5px] last:border-none"
              >
                <Checkbox checked={done} onCheckedChange={() => toggleToday(task.id)} />
                <span className={cn("flex-1", done && "text-muted-foreground line-through")}>{task.title}</span>
                <button
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove ${task.title}`}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            );
          })}

        <form onSubmit={handleAdd} className="mt-3 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a daily routine item…"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" size="icon" className="h-6 w-6 rounded-full text-xs">+</Button>
        </form>
      </CardContent>
    </Card>
  );
}
