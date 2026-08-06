"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo } from "@/lib/types/database.types";

export function TaskItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = !todo.is_completed && todo.due_date && todo.due_date < new Date().toISOString().split("T")[0];

  return (
    <div className="group flex items-center gap-2.5 border-b border-border py-2.5 text-[13.5px] last:border-none">
      <Checkbox checked={todo.is_completed} onCheckedChange={(checked) => onToggle(todo.id, checked === true)} />
      <span className={cn("flex-1", todo.is_completed && "text-muted-foreground line-through")}>{todo.title}</span>

      {todo.due_date && (
        <span className={cn("font-mono text-[10.5px] text-muted-foreground", isOverdue && "text-destructive")}>
          {todo.due_date}
        </span>
      )}
      {todo.tag && (
        <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground">
          {todo.tag}
        </span>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={() => onDelete(todo.id)}
        aria-label="Delete task"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
