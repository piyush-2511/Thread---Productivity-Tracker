"use client";

import { useState } from "react";
import { useThoughts } from "@/hooks/use-thoughts";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pinned", label: "📌 Pinned" },
  { key: "quote", label: "Quotes" },
  { key: "insight", label: "Insights" },
  { key: "mood", label: "Mood" },
] as const;

export function ThoughtWall() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  const { thoughts, loading, togglePin } = useThoughts(
    filter === "pinned" ? { pinnedOnly: true } : filter === "all" ? undefined : { tag: filter }
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:col-span-2 lg:col-span-3">
      <h2 className="mb-3 font-serif text-[15px] font-medium">
        Thought wall <span className="font-mono text-xs font-normal text-muted-foreground">{thoughts.length} entries</span>
      </h2>

      {loading && <LoadingSkeleton className="h-24 w-full" />}

      {!loading && thoughts.length === 0 && <EmptyState message="No entries yet — write one from the Today screen." />}

      {!loading && thoughts.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {thoughts.map((t) => (
            <button
              key={t.id}
              onClick={() => togglePin(t.id, !t.is_pinned)}
              className="rounded-xl border border-border p-3 text-left transition-colors hover:border-accent"
            >
              <p className="font-serif text-[13.5px] italic leading-snug">"{t.content}"</p>
              <div className="mt-2 flex items-center justify-between">
                {t.tag && (
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[9.5px] uppercase text-muted-foreground">
                    {t.tag}
                  </span>
                )}
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {t.is_pinned && "📌 "}
                  {t.entry_date.slice(5)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11.5px]",
              filter === f.key ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
