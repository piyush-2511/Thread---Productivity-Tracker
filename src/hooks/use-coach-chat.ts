"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage } from "@/lib/types/database.types";
import { getChatHistory, clearChatHistory } from "@/lib/queries/coach";

export function useCoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setMessages(await getChatHistory());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load chat history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;

    const optimisticUser: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      user_id: "",
      role: "user",
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reach the AI Coach");

      const assistantMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        user_id: "",
        role: "assistant",
        content: data.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  async function clearHistory() {
    setMessages([]);
    try {
      await clearChatHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear history");
      refresh();
    }
  }

  return { messages, loading, sending, error, sendMessage, clearHistory };
}
