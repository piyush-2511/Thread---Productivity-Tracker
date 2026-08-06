"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HabitForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: { title: string; frequency: "daily" | "weekly"; description?: string }) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), frequency });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input placeholder="Habit name, e.g. Meditate" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />

      <div className="flex gap-2">
        {(["daily", "weekly"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFrequency(f)}
            className={`flex-1 rounded-lg border py-2 text-xs font-medium capitalize ${
              frequency === f ? "border-accent bg-accent text-accent-foreground" : "border-input text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Create habit</Button>
      </div>
    </form>
  );
}
