import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types/database.types";

/**
 * Read-only from the client — actual message sending goes through
 * /api/coach, since that's the only place allowed to call Gemini.
 */
export async function getChatHistory(limit = 50): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function clearChatHistory(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("chat_messages").delete().eq("user_id", user.id);
  if (error) throw error;
}
