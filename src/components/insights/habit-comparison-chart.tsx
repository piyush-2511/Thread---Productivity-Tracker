"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import type { Habit } from "@/lib/types/database.types";

export function HabitComparisonChart({ data }: { data: { habit: Habit; rate: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-2 font-serif text-[15px] font-medium">Habit comparison</h2>
        <p className="text-xs text-muted-foreground">No habits yet.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.habit.title, rate: d.rate }));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 font-serif text-[15px] font-medium">Habit comparison</h2>
      <ResponsiveContainer width="100%" height={Math.max(100, chartData.length * 34)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} width={90} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`${value}%`, "Completion"]}
          />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={14}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.rate >= 70 ? "hsl(var(--success))" : "hsl(var(--accent))"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
