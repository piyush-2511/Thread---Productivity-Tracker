"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TodoQuickAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task…"
        className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
      />
      <Button type="submit" size="icon" className="h-6 w-6 rounded-full text-xs">+</Button>
    </form>
  );
}
