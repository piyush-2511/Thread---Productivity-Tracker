"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChallengeForm({
  onSubmit,
}: {
  onSubmit: (input: { title: string; description?: string; duration_days: number; taskTitles: string[] }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);

  function addTask() {
    if (!taskInput.trim()) return;
    setTasks((prev) => [...prev, taskInput.trim()]);
    setTaskInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || tasks.length === 0) return;
    onSubmit({ title: title.trim(), description: description.trim() || undefined, duration_days: duration, taskTitles: tasks });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input placeholder="Challenge name, e.g. 75 Focused Hours" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Duration (days)</label>
        <Input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Daily requirement(s)</label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Deep work, 90 min"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTask();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addTask}>
            Add
          </Button>
        </div>
        {tasks.length > 0 && (
          <ul className="mt-2 space-y-1">
            {tasks.map((t, i) => (
              <li key={i} className="rounded-md bg-secondary px-2.5 py-1.5 text-xs">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!title.trim() || tasks.length === 0}>
        Create challenge
      </Button>
    </form>
  );
}
