"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatPanel } from "@/components/coach/chat-panel";

/** Floating chat button — mounted once in the (app) layout, available on every screen. */
export function ChatFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg md:bottom-6 md:right-6"
        style={{ width: 52, height: 52 }}
        aria-label="Open AI Coach"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
      <ChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
