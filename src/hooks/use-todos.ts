"use client";

import { useCallback, useEffect, useState } from "react";
import type { Todo } from "@/lib/types/database.types";
import { getTodos, createTodo, toggleTodoComplete, deleteTodo } from "@/lib/queries/todos";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setTodos(await getTodos());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addTodo(title: string, opts?: { tag?: string; due_date?: string }) {
    const optimistic: Todo = {
      id: `temp-${Date.now()}`,
      user_id: "",
      title,
      description: null,
      tag: opts?.tag ?? null,
      due_date: opts?.due_date ?? null,
      is_completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTodos((prev) => [optimistic, ...prev]);

    try {
      const created = await createTodo({ title, ...opts });
      setTodos((prev) => prev.map((t) => (t.id === optimistic.id ? created : t)));
    } catch (e) {
      setTodos((prev) => prev.filter((t) => t.id !== optimistic.id));
      setError(e instanceof Error ? e.message : "Failed to add todo");
    }
  }

  async function toggleComplete(id: string, isCompleted: boolean) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, is_completed: isCompleted } : t)));
    try {
      await toggleTodoComplete(id, isCompleted);
    } catch (e) {
      refresh(); // revert to server state on failure
      setError(e instanceof Error ? e.message : "Failed to update todo");
    }
  }

  async function removeTodo(id: string) {
    const prev = todos;
    setTodos((cur) => cur.filter((t) => t.id !== id));
    try {
      await deleteTodo(id);
    } catch (e) {
      setTodos(prev);
      setError(e instanceof Error ? e.message : "Failed to delete todo");
    }
  }

  return { todos, loading, error, addTodo, toggleComplete, removeTodo, refresh };
}
