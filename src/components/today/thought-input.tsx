"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTodayThought } from "@/hooks/use-thoughts";

export function ThoughtInput() {
  const { content, loading, saving, save } = useTodayThought();
  const [value, setValue] = useState("");

  useEffect(() => setValue(content), [content]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's thought</CardTitle>
        {saving && <span className="font-mono text-[10px] text-muted-foreground">saving…</span>}
      </CardHeader>
      <CardContent>
        <textarea
          rows={2}
          disabled={loading}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => value.trim() && save(value.trim())}
          placeholder="Something worth remembering from today…"
          className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 font-serif text-[13.5px] italic outline-none placeholder:text-muted-foreground placeholder:not-italic"
        />
      </CardContent>
    </Card>
  );
}
