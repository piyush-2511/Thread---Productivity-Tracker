"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { StreakBadge } from "@/components/shared/streak-badge";
import { useHabits } from "@/hooks/use-habits";
import { cn } from "@/lib/utils";

export function HabitsDueToday() {
  const { habits, loading, isCompletedToday, toggleToday } = useHabits();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habits</CardTitle>
        <span className="font-mono text-xs text-muted-foreground">{habits.length} due</span>
      </CardHeader>
      <CardContent>
        {loading && <LoadingSkeleton className="h-16 w-full" />}

        {!loading && habits.length === 0 && (
          <EmptyState message="No habits yet — create one from the Habits tab." />
        )}

        {!loading &&
          habits.map((habit) => {
            const done = isCompletedToday(habit.id);
            return (
              <div key={habit.id} className="flex items-center gap-2.5 border-b border-border py-2 text-[13.5px] last:border-none">
                <Checkbox checked={done} onCheckedChange={() => toggleToday(habit.id)} />
                <span className={cn(done && "text-muted-foreground line-through")}>{habit.title}</span>
                {/* Streak value is computed properly on the Habits detail page; this is a placeholder pending that fetch */}
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
