"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export function MessageInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 pl-3.5">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask your coach anything…"
        disabled={disabled}
        className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground disabled:opacity-60"
      />
      <Button type="submit" size="icon" className="h-8 w-8 shrink-0 rounded-full" disabled={disabled || !value.trim()}>
        <ArrowUp className="h-4 w-4" />
      </Button>
    </form>
  );
}
