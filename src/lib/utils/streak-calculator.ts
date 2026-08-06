type LogEntry = { log_date: string; is_completed: boolean; is_freeze?: boolean };

/**
 * Calculates the current consecutive-day streak from a list of logs.
 * A freeze day (is_freeze: true) counts as maintaining the streak
 * without counting as a completion.
 * Expects logs sorted descending by log_date (most recent first).
 */
export function calculateCurrentStreak(logs: LogEntry[]): number {
  if (logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) => (a.log_date < b.log_date ? 1 : -1));

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const log of sorted) {
    const logDate = new Date(`${log.log_date}T00:00:00`);
    const expected = cursor.toISOString().split("T")[0];

    if (log.log_date !== expected) break; // gap in the chain — streak ends
    if (!log.is_completed && !log.is_freeze) break;

    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Best (longest) streak ever recorded, using the same rules as current streak. */
export function calculateBestStreak(logs: LogEntry[]): number {
  const sorted = [...logs].sort((a, b) => (a.log_date > b.log_date ? 1 : -1));

  let best = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const log of sorted) {
    const date = new Date(`${log.log_date}T00:00:00`);
    const isHit = log.is_completed || log.is_freeze;

    if (!isHit) {
      running = 0;
      prevDate = null;
      continue;
    }

    if (prevDate) {
      const diffDays = Math.round((date.getTime() - prevDate.getTime()) / 86400000);
      running = diffDays === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }

    best = Math.max(best, running);
    prevDate = date;
  }

  return best;
}
