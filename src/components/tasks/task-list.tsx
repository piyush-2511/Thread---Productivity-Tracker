"use client";

import { useMemo, useState } from "react";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskForm } from "@/components/tasks/task-form";
import { TodoQuickAdd } from "@/components/today/todo-quick-add";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useTodos } from "@/hooks/use-todos";
import { cn } from "@/lib/utils";

export function TaskList() {
  const { todos, loading, addTodo, toggleComplete, removeTodo } = useTodos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null); // null = "All"

  // Derive the unique set of tags from the loaded todos
  const tags = useMemo(() => {
    const set = new Set<string>();
    todos.forEach((t) => t.tag && set.add(t.tag));
    return Array.from(set);
  }, [todos]);

  // Apply tag filter before splitting into overdue/upcoming
  const filteredTodos = useMemo(
    () => (activeTag ? todos.filter((t) => t.tag === activeTag) : todos),
    [todos, activeTag]
  );

  const overdue = filteredTodos.filter(
    (t) => !t.is_completed && t.due_date && t.due_date < new Date().toISOString().split("T")[0]
  );
  const upcoming = filteredTodos.filter((t) => !overdue.includes(t));

  async function handleFormSubmit(input: { title: string; tag?: string; due_date?: string }) {
    await addTodo(input.title, { tag: input.tag, due_date: input.due_date });
    setDialogOpen(false);
  }

  return (
    <div className="space-y-5">
      {loading && <LoadingSkeleton className="h-40 w-full rounded-2xl" />}

      {/* Tag filter pills */}
      {!loading && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTag(null)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11.5px]",
              activeTag === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px]",
                activeTag === tag
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {!loading && overdue.length > 0 && (
        <div>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-destructive">Overdue</h3>
          <div className="rounded-2xl border border-border bg-card p-3">
            {overdue.map((t) => (
              <TaskItem key={t.id} todo={t} onToggle={toggleComplete} onDelete={removeTodo} />
            ))}
          </div>
        </div>
      )}

      {!loading && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">All tasks</h3>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11.5px]">
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Task with date
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>New task with a due date</DialogTitle>
                <p className="mb-3 -mt-2 text-[12px] text-muted-foreground">
                  For things that belong on a future day — not today's quick list.
                </p>
                <TaskForm onSubmit={handleFormSubmit} onCancel={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3">
            {upcoming.length === 0 ? (
              <EmptyState message={activeTag ? `No "${activeTag}" tasks.` : "No tasks yet. Add your first one below."} />
            ) : (
              upcoming.map((t) => <TaskItem key={t.id} todo={t} onToggle={toggleComplete} onDelete={removeTodo} />)
            )}
            <TodoQuickAdd onAdd={(title) => addTodo(title)} />
          </div>
        </div>
      )}
    </div>
  );
}