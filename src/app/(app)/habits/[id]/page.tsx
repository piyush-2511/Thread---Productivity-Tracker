"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getHabits, getHabitLogs, deleteHabit } from "@/lib/queries/habits";
import { calculateCurrentStreak, calculateBestStreak } from "@/lib/utils/streak-calculator";
import { HabitHeatmap } from "@/components/habits/habit-heatmap";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import type { Habit, HabitLog } from "@/lib/types/database.types";

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [allHabits, habitLogs] = await Promise.all([getHabits(), getHabitLogs(id, 30)]);
      setHabit(allHabits.find((h) => h.id === id) ?? null);
      setLogs(habitLogs);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!habit) return;
    if (!confirm(`Delete "${habit.title}"? This won't remove past history.`)) return;
    await deleteHabit(habit.id);
    router.push("/habits");
  }

  if (loading) {
    return (
      <div className="p-5 md:p-8">
        <LoadingSkeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="p-5 md:p-8">
        <p className="text-sm text-muted-foreground">Habit not found.</p>
      </div>
    );
  }

  const currentStreak = calculateCurrentStreak(logs);
  const bestStreak = calculateBestStreak(logs);
  const completedDays = logs.filter((l) => l.is_completed).length;

  return (
    <>
      <Header eyebrow={habit.frequency} title={habit.title} sub={habit.description ?? undefined} />

      <div className="space-y-4 p-5 md:p-8">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Current streak" value={`${currentStreak}d`} />
          <StatCard label="Best streak" value={`${bestStreak}d`} />
          <StatCard label="Last 30 days" value={`${completedDays}/30`} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 font-serif text-[15px] font-medium">Last 30 days</h2>
          <HabitHeatmap logs={logs} days={30} />
        </div>

        <Button variant="destructive" onClick={handleDelete}>
          Delete habit
        </Button>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <div className="font-mono text-xl font-medium">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
