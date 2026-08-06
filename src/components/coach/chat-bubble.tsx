import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types/database.types";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
        isUser
          ? "self-end rounded-br-md bg-primary text-primary-foreground"
          : "self-start rounded-bl-md border border-border bg-card"
      )}
    >
      {message.content}
    </div>
  );
}
