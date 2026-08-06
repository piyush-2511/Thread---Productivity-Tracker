"use client";

import { useCallback, useEffect, useState } from "react";
import type { Thought } from "@/lib/types/database.types";
import { getThoughts, getTodayThought, upsertTodayThought, togglePinThought } from "@/lib/queries/thoughts";

export function useThoughts(filter?: { tag?: "mood" | "quote" | "insight"; pinnedOnly?: boolean }) {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setThoughts(await getThoughts(filter));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load thoughts");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.tag, filter?.pinnedOnly]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function togglePin(id: string, isPinned: boolean) {
    setThoughts((prev) => prev.map((t) => (t.id === id ? { ...t, is_pinned: isPinned } : t)));
    try {
      await togglePinThought(id, isPinned);
    } catch (e) {
      refresh();
      setError(e instanceof Error ? e.message : "Failed to update pin");
    }
  }

  return { thoughts, loading, error, togglePin, refresh };
}

/** Separate, lighter hook just for the Today screen's single daily entry field. */
export function useTodayThought() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTodayThought().then((t) => {
      setContent(t?.content ?? "");
      setLoading(false);
    });
  }, []);

  async function save(newContent: string, tag?: "mood" | "quote" | "insight") {
    setSaving(true);
    setContent(newContent);
    try {
      await upsertTodayThought(newContent, tag);
    } finally {
      setSaving(false);
    }
  }

  return { content, loading, saving, save };
}
