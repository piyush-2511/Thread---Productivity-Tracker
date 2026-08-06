"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { DailyCompletionRow } from "@/lib/queries/insights";

export function CompletionTrendChart({ data }: { data: DailyCompletionRow[] }) {
  const chartData = data.map((d) => ({ date: d.log_date.slice(5), rate: d.completion_rate }));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 font-serif text-[15px] font-medium">
        Completion trend <span className="font-mono text-xs font-normal text-muted-foreground">last {data.length} days</span>
      </h2>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={Math.ceil(chartData.length / 6)} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={28} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`${value}%`, "Completion"]}
          />
          <Line type="monotone" dataKey="rate" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
