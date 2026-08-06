"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useScreenTime } from "@/hooks/use-screen-time";

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function ScreenTimeInput() {
  const { minutes, goalMinutes, percentOfGoal, loading, saving, save } = useScreenTime();
  const [inputValue, setInputValue] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (minutes !== null) setInputValue(String(minutes));
  }, [minutes]);

  function handleSave() {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed >= 0) save(parsed);
    setEditing(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Screen time</CardTitle>
        {saving && <span className="font-mono text-[10px] text-muted-foreground">saving…</span>}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Minutes today"
              className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 font-mono text-sm outline-none"
            />
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-left" disabled={loading}>
            <div className="font-mono text-[22px] font-medium">{minutes !== null ? formatMinutes(minutes) : "— tap to log"}</div>
          </button>
        )}

        <div className="mt-1 text-[11.5px] text-muted-foreground">
          Goal {goalMinutes ? formatMinutes(goalMinutes) : "—"} · {percentOfGoal}%
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${percentOfGoal}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
