"use client";

import { useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { useCoachChat } from "@/hooks/use-coach-chat";
import { ChatBubble } from "@/components/coach/chat-bubble";
import { MessageInput } from "@/components/coach/message-input";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const SUGGESTIONS = [
  "How can I improve my diet?",
  "What should I cut from my routine to be more productive?",
  "How's my habit consistency this month?",
];

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { messages, loading, sending, error, sendMessage, clearHistory } = useCoachChat();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/20 md:items-center md:p-6">
      {/* Backdrop */}
      <button className="absolute inset-0" onClick={onClose} aria-label="Close chat" />

      <div className="relative flex h-[85vh] w-full flex-col rounded-t-2xl border border-border bg-background p-4 md:h-[640px] md:w-[420px] md:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-[16px] font-medium">AI Coach</h2>
            <p className="text-[11.5px] text-muted-foreground">Grounded in what you've actually logged.</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={clearHistory} className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Clear history">
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={logRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto py-2">
          {loading && <LoadingSkeleton className="h-24 w-full" />}

          {!loading && messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">Ask about anything you've been tracking.</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-[11.5px] text-muted-foreground hover:border-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}

          {sending && (
            <div className="self-start rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-2.5 text-[13px] text-muted-foreground">
              Thinking…
            </div>
          )}
        </div>

        {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

        <MessageInput onSend={sendMessage} disabled={sending} />
      </div>
    </div>
  );
}
