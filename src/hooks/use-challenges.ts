"use client";

import { useCallback, useEffect, useState } from "react";
import type { Challenge, ChallengeLog } from "@/lib/types/database.types";
import { getActiveChallenges, getTodayChallengeLogs, createChallenge, endChallenge } from "@/lib/queries/challenges";

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [todayLogs, setTodayLogs] = useState<ChallengeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [c, logs] = await Promise.all([getActiveChallenges(), getTodayChallengeLogs()]);
      setChallenges(c);
      setTodayLogs(logs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isDoneToday(challengeId: string) {
    return todayLogs.some((l) => l.challenge_id === challengeId && l.is_completed);
  }

  async function addChallenge(input: {
    title: string;
    description?: string;
    duration_days: number;
    taskTitles: string[];
  }) {
    try {
      const created = await createChallenge(input);
      setChallenges((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create challenge");
      throw e;
    }
  }

  async function removeChallenge(id: string) {
    const prev = challenges;
    setChallenges((cur) => cur.filter((c) => c.id !== id));
    try {
      await endChallenge(id);
    } catch (e) {
      setChallenges(prev);
      setError(e instanceof Error ? e.message : "Failed to end challenge");
    }
  }

  return { challenges, loading, error, isDoneToday, addChallenge, removeChallenge, refresh };
}
