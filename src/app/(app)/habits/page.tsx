"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useHabits } from "@/hooks/use-habits";
import { useChallenges } from "@/hooks/use-challenges";
import { getHabitLogs } from "@/lib/queries/habits";
import { getChallengeLogs } from "@/lib/queries/challenges";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { challengeProgressPercent } from "@/lib/utils/completion-rate";
import { cn } from "@/lib/utils";
import type { HabitLog } from "@/lib/types/database.types";

/**
 * Habits page — hosts two sub-tabs: Habits and Challenges.
 * They're nested here (rather than separate top-level nav items) to keep
 * the bottom nav at 5 tabs once Diet joined the lineup.
 */
export default function HabitsPage() {
  const [tab, setTab] = useState<"habits" | "challenges">("habits");

  return (
    <>
      <Header eyebrow="Habits" title="Consistency" sub="Daily rhythms and time-bound challenges." />

      <div className="p-5 md:p-8">
        <div className="mb-4 inline-flex gap-1 rounded-xl bg-secondary p-1">
          <button
            onClick={() => setTab("habits")}
            className={cn(
              "rounded-lg px-4 py-2 text-[12.5px] font-semibold",
              tab === "habits" ? "bg-card shadow-sm" : "text-muted-foreground"
            )}
          >
            Habits
          </button>
          <button
            onClick={() => setTab("challenges")}
            className={cn(
              "rounded-lg px-4 py-2 text-[12.5px] font-semibold",
              tab === "challenges" ? "bg-card shadow-sm" : "text-muted-foreground"
            )}
          >
            Challenges
          </button>
        </div>

        {tab === "habits" ? <HabitsPanel /> : <ChallengesPanel />}
      </div>
    </>
  );
}

function HabitsPanel() {
  const { habits, loading, isCompletedToday, addHabit, toggleToday } = useHabits();
  const [logsByHabit, setLogsByHabit] = useState<Record<string, HabitLog[]>>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    habits.forEach(async (habit) => {
      if (logsByHabit[habit.id]) return;
      const logs = await getHabitLogs(habit.id, 7);
      setLogsByHabit((prev) => ({ ...prev, [habit.id]: logs }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits]);

  return (
    <div className="space-y-3">
      {loading && <LoadingSkeleton className="h-24 w-full rounded-2xl" />}

      {!loading && habits.length === 0 && !showForm && (
        <EmptyState
          message="No habits yet. Start with one thing you want to be consistent about."
          action={<Button onClick={() => setShowForm(true)}>Create habit</Button>}
        />
      )}

      {!loading &&
        habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            logs={logsByHabit[habit.id] ?? []}
            isCompletedToday={isCompletedToday(habit.id)}
            onToggleToday={() => toggleToday(habit.id)}
          />
        ))}

      {!loading && habits.length > 0 && !showForm && (
        <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
          + New habit
        </Button>
      )}

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <HabitForm
            onSubmit={async (input) => {
              await addHabit(input);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
}

function ChallengesPanel() {
  const { challenges, loading } = useChallenges();
  const [percentByChallenge, setPercentByChallenge] = useState<Record<string, number>>({});

  useEffect(() => {
    challenges.forEach(async (c) => {
      if (percentByChallenge[c.id] !== undefined) return;
      const logs = await getChallengeLogs(c.id);
      const completedDays = new Set(logs.filter((l) => l.is_completed).map((l) => l.log_date)).size;
      setPercentByChallenge((prev) => ({ ...prev, [c.id]: challengeProgressPercent(c.duration_days, completedDays) }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges]);

  return (
    <div className="space-y-3">
      {loading && <LoadingSkeleton className="h-28 w-full rounded-2xl" />}

      {!loading && challenges.length === 0 && (
        <EmptyState
          message="No active challenges. Start one when you're ready to commit to something for a set number of days."
          action={
            <Link href="/challenges/new">
              <Button>Create challenge</Button>
            </Link>
          }
        />
      )}

      {!loading &&
        challenges.map((c) => (
          <ChallengeCard key={c.id} challenge={c} percentDone={percentByChallenge[c.id] ?? 0} />
        ))}

      {!loading && (
        <Link href="/challenges/new">
          <Button variant="outline" className="w-full">
            + New challenge
          </Button>
        </Link>
      )}
    </div>
  );
}
