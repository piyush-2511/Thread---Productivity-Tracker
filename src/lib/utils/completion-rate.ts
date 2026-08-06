type Completable = { is_completed: boolean };

/** Returns a 0–100 completion percentage for any list of completable items. */
export function completionRate(items: Completable[]): number {
  if (items.length === 0) return 0;
  const done = items.filter((i) => i.is_completed).length;
  return Math.round((done / items.length) * 100);
}

/** Formats a completion rate as "x/y" for compact display, e.g. "4/6". */
export function completionFraction(items: Completable[]): string {
  const done = items.filter((i) => i.is_completed).length;
  return `${done}/${items.length}`;
}

/** Percent of a challenge's duration that has passed and been logged as done. */
export function challengeProgressPercent(
  durationDays: number,
  completedLogCount: number
): number {
  if (durationDays === 0) return 0;
  return Math.min(100, Math.round((completedLogCount / durationDays) * 100));
}
