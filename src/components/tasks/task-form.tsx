"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Fuller task form (title + tag + due date) — used from a dialog/drawer for detailed entry. */
export function TaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: { title: string; tag?: string; due_date?: string }) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), tag: tag.trim() || undefined, due_date: dueDate || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      <Input placeholder="Tag (optional)" value={tag} onChange={(e) => setTag(e.target.value)} />
      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Add task</Button>
      </div>
    </form>
  );
}
