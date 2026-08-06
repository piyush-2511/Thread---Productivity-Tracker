  "use client";

  import { useEffect, useState } from "react";
  import { useParams, useRouter } from "next/navigation";
  import {
    getChallenge,
    getChallengeTasks,
    getChallengeLogs,
    toggleChallengeTaskToday,
    endChallenge,
  } from "@/lib/queries/challenges";
  import { challengeProgressPercent } from "@/lib/utils/completion-rate";
  import { todayISO } from "@/lib/utils/date-helpers";
  import { Header } from "@/components/layout/header";
  import { Button } from "@/components/ui/button";
  import { Checkbox } from "@/components/ui/checkbox";
  import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
  import type { Challenge, ChallengeTask, ChallengeLog } from "@/lib/types/database.types";

  export default function ChallengeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [tasks, setTasks] = useState<ChallengeTask[]>([]);
    const [logs, setLogs] = useState<ChallengeLog[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
      const [c, t, l] = await Promise.all([getChallenge(id), getChallengeTasks(id), getChallengeLogs(id)]);
      setChallenge(c);
      setTasks(t);
      setLogs(l);
      setLoading(false);
    }

    useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    function isTaskDoneToday(taskId: string) {
      return logs.some((l) => l.challenge_task_id === taskId && l.log_date === todayISO() && l.is_completed);
    }

    async function handleToggleTask(taskId: string) {
      const done = isTaskDoneToday(taskId);
      await toggleChallengeTaskToday(id, taskId, !done);
      load();
    }

    async function handleEnd() {
      if (!challenge) return;
      if (!confirm(`End "${challenge.title}"? This won't remove past history.`)) return;
      await endChallenge(challenge.id);
      router.push("/habits"); // ← was "/challenges", which no longer exists
    }

    if (loading) {
      return (
        <div className="p-5 md:p-8">
          <LoadingSkeleton className="h-40 w-full rounded-2xl" />
        </div>
      );
    }

    if (!challenge) {
      return (
        <div className="p-5 md:p-8">
          <p className="text-sm text-muted-foreground">Challenge not found.</p>
        </div>
      );
    }

    const completedDays = new Set(logs.filter((l) => l.is_completed).map((l) => l.log_date)).size;
    const percent = challengeProgressPercent(challenge.duration_days, completedDays);
    const start = new Date(`${challenge.start_date}T00:00:00`);
    const today = new Date(`${todayISO()}T00:00:00`);
    const dayNumber = Math.min(
      Math.max(Math.floor((today.getTime() - start.getTime()) / 86400000) + 1, 1),
      challenge.duration_days
    );

    return (
      <>
        <Header
          eyebrow={`Day ${dayNumber} of ${challenge.duration_days}`}
          title={challenge.title}
          sub={challenge.description ?? undefined}
        />

        <div className="space-y-4 p-5 md:p-8">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Progress" value={`${percent}%`} />
            <StatCard label="Days done" value={`${completedDays}`} />
            <StatCard label="Days left" value={`${Math.max(challenge.duration_days - dayNumber, 0)}`} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 font-serif text-[15px] font-medium">Today's requirements</h2>
            {tasks.map((task) => {
              const done = isTaskDoneToday(task.id);
              return (
                <div key={task.id} className="flex items-center gap-2.5 border-b border-border py-2.5 text-[13.5px] last:border-none">
                  <Checkbox checked={done} onCheckedChange={() => handleToggleTask(task.id)} />
                  <span className={done ? "text-muted-foreground line-through" : ""}>{task.title}</span>
                </div>
              );
            })}
          </div>

          <Button variant="destructive" onClick={handleEnd}>
            End challenge
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
