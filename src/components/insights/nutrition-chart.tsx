"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import type { DailyNutritionRow } from "@/lib/queries/insights";

export function NutritionChart({ data, targetCalories }: { data: DailyNutritionRow[]; targetCalories: number | null }) {
  const chartData = data.map((d) => ({ date: d.log_date.slice(5), calories: Math.round(d.total_calories ?? 0) }));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 font-serif text-[15px] font-medium">
        Nutrition vs. target <span className="font-mono text-xs font-normal text-muted-foreground">calories/day</span>
      </h2>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={chartData}>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={Math.ceil(chartData.length / 6)} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`${value} kcal`, "Logged"]}
          />
          {targetCalories && <ReferenceLine y={targetCalories} stroke="hsl(var(--accent))" strokeDasharray="4 4" />}
          <Bar dataKey="calories" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
