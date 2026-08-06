/** Returns today's date as 'YYYY-MM-DD', matching Postgres `date` columns. */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Formats a 'YYYY-MM-DD' string as a friendly label, e.g. "Fri, Aug 01". */
export function formatFriendlyDate(dateStr: string = todayISO()): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit" });
}

/** Returns an array of the last N dates (including today) as 'YYYY-MM-DD', oldest first. */
export function lastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}
