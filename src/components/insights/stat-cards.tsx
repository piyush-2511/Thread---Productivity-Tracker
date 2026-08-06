export function StatCards({ avgCompletion, bestStreak, avgEnergyLabel }: { avgCompletion: number; bestStreak: number; avgEnergyLabel: string }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat value={`${avgCompletion}%`} label="Avg completion" />
      <Stat value={`${bestStreak}d`} label="Best streak" />
      <Stat value={avgEnergyLabel} label="Avg energy" />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <div className="font-mono text-xl font-medium">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
