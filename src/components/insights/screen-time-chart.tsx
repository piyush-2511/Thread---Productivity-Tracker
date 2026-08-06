export function ScreenTimeInsight({ underGoalAvg, overGoalAvg }: { underGoalAvg: number; overGoalAvg: number }) {
  const hasData = underGoalAvg > 0 || overGoalAvg > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 font-serif text-[15px] font-medium">Screen time vs. completion</h2>
      {!hasData ? (
        <p className="text-xs text-muted-foreground">Not enough data yet — log screen time for a few more days.</p>
      ) : (
        <p className="text-xs leading-relaxed text-muted-foreground">
          On days under <span className="font-semibold text-foreground">2.5h</span> screen time, your task completion
          rate averages <span className="font-semibold text-success">{underGoalAvg}%</span> — versus{" "}
          <span className="font-semibold text-destructive">{overGoalAvg}%</span> on days over 4h.
        </p>
      )}
    </div>
  );
}
