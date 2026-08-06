export function NutritionProgressRing({ label, value, target, unit }: { label: string; value: number; target: number | null; unit: string }) {
  const percent = target ? Math.min(100, Math.round((value / target) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <div className="font-mono text-lg font-medium">
        {Math.round(value)}
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-0.5 text-[10.5px] text-muted-foreground">/ {target ?? "—"}{unit} {label}</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-success" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
