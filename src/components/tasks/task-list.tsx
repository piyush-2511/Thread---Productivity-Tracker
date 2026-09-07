"use client";

import { useMemo, useState } from "react";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskForm } from "@/components/tasks/task-form";
import { TodoQuickAdd } from "@/components/today/todo-quick-add";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarPlus, ChevronDown, X, RotateCcw, Trash2 } from "lucide-react";
import { useTodos } from "@/hooks/use-todos";
import { cn } from "@/lib/utils";
import type { Todo } from "@/lib/types/database.types";

const NO_TAG = "No tag";
type QuickFilter = "all" | "today";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function TaskList() {
  const { todos, loading, addTodo, toggleComplete, removeTodo } = useTodos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null); // null = every tag
  const [completedOpen, setCompletedOpen] = useState(true);
  const [hiddenTags, setHiddenTags] = useState<Set<string>>(new Set()); // dismissed filter pills

  const allTags = useMemo(() => {
    const set = new Set<string>();
    todos.forEach((t) => t.tag && set.add(t.tag));
    return Array.from(set);
  }, [todos]);

  // Pills actually shown in the filter bar — allTags minus dismissed ones
  const visibleTags = useMemo(
    () => allTags.filter((t) => !hiddenTags.has(t)),
    [allTags, hiddenTags]
  );

  function hideTag(tag: string) {
    setHiddenTags((prev) => new Set(prev).add(tag));
    if (activeTag === tag) setActiveTag(null); // don't leave an invisible filter active
  }

  function restoreAllTags() {
    setHiddenTags(new Set());
  }

  // Split completed vs active — completed items leave the main box entirely
  const { activeTodos, completedTodos } = useMemo(() => {
    const active: Todo[] = [];
    const completed: Todo[] = [];
    for (const t of todos) (t.is_completed ? completed : active).push(t);
    return { activeTodos: active, completedTodos: completed };
  }, [todos]);

  const applyFilters = (list: Todo[]) =>
    list.filter((t) => {
      if (quickFilter === "today" && t.due_date !== todayISO()) return false;
      if (activeTag && t.tag !== activeTag) return false;
      return true;
    });

  const filteredActive = useMemo(() => applyFilters(activeTodos), [activeTodos, quickFilter, activeTag]);
  const filteredCompleted = useMemo(() => applyFilters(completedTodos), [completedTodos, quickFilter, activeTag]);

  const overdue = filteredActive.filter((t) => t.due_date && t.due_date < todayISO());
  const upcoming = filteredActive.filter((t) => !overdue.includes(t));

  const groupedUpcoming = useMemo(() => {
    if (activeTag) return { [activeTag]: upcoming };
    const groups: Record<string, Todo[]> = {};
    for (const t of upcoming) {
      const key = t.tag ?? NO_TAG;
      (groups[key] ??= []).push(t);
    }
    return groups;
  }, [upcoming, activeTag]);

  async function handleFormSubmit(input: { title: string; tag?: string; due_date?: string }) {
    await addTodo(input.title, { tag: input.tag, due_date: input.due_date });
    setDialogOpen(false);
  }

  // Bulk-remove every currently-visible completed task (respects active filters)
  async function clearCompleted() {
    await Promise.all(filteredCompleted.map((t) => removeTodo(t.id)));
  }

  return (
    <div className="space-y-5">
      {loading && <LoadingSkeleton className="h-40 w-full rounded-2xl" />}

      {/* Filters: quick (All/Today) + dismissible tag pills */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "today"] as QuickFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setQuickFilter(f)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] capitalize",
                quickFilter === f
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {f}
            </button>
          ))}

          {visibleTags.length > 0 && <div className="mx-1 w-px self-stretch bg-border" />}

          {visibleTags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "group flex items-center gap-1 rounded-full border pl-2.5 pr-1 py-1 text-[11.5px]",
                activeTag === tag
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              <button onClick={() => setActiveTag((cur) => (cur === tag ? null : tag))}>
                {tag}
              </button>
              <button
                onClick={() => hideTag(tag)}
                className="rounded-full p-0.5 opacity-50 hover:opacity-100 hover:bg-muted"
                aria-label={`Hide ${tag} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {hiddenTags.size > 0 && (
            <button
              onClick={restoreAllTags}
              className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-[11.5px] text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              {hiddenTags.size} hidden
            </button>
          )}
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
            <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {quickFilter === "today" ? "Today" : "All tasks"}
            </h3>
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
              <EmptyState message="No tasks here." />
            ) : (
              Object.entries(groupedUpcoming).map(([tag, items]) =>
                items.length === 0 ? null : (
                  <div key={tag} className="mb-3 last:mb-0">
                    {!activeTag && (
                      <p className="mb-1 px-1 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                        {tag}
                      </p>
                    )}
                    {items.map((t) => (
                      <TaskItem key={t.id} todo={t} onToggle={toggleComplete} onDelete={removeTodo} />
                    ))}
                  </div>
                )
              )
            )}
            <TodoQuickAdd onAdd={(title) => addTodo(title)} />
          </div>
        </div>
      )}

      {/* Completed — collapsed section with per-item and bulk "cut" options */}
      {!loading && filteredCompleted.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={() => setCompletedOpen((v) => !v)}
              className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
            >
              <span>Completed ({filteredCompleted.length})</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", completedOpen && "rotate-180")} />
            </button>

            {completedOpen && (
              <button
                onClick={clearCompleted}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          {completedOpen && (
            <div className="rounded-2xl border border-border bg-card p-3 opacity-70">
              {filteredCompleted.map((t) => (
                <div key={t.id} className="group flex items-center gap-1">
                  <div className="flex-1">
                    <TaskItem todo={t} onToggle={toggleComplete} onDelete={removeTodo} />
                  </div>
                  {/* Quick "cut" — removes this one task straight from Completed */}
                  {/* <button
                    onClick={() => removeTodo(t.id)}
                    className="shrink-0 rounded-full p-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                    aria-label="Remove completed task"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button> */}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}