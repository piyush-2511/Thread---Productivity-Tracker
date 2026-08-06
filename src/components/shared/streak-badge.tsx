export function StreakBadge({ days }: { days: number }) {
  if (days === 0) return null;
  return (
    <span className="ml-auto font-mono text-[11px] font-medium text-accent">
      🔥 {days}d
    </span>
  );
}
