"use client";

import Link from "next/link";
import { useChallenges } from "@/hooks/use-challenges";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

/** Shows the most recently created active challenge on the Today screen. */
export function ChallengeProgressCard() {
  const { challenges, loading } = useChallenges();

  if (loading) return <LoadingSkeleton className="h-28 w-full rounded-2xl" />;
  if (challenges.length === 0) return null;

  const challenge = challenges[0];

  return (
    <Link href={`/challenges/${challenge.id}`}>
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-serif text-[15px] font-medium">{challenge.title}</h2>
          <span className="font-mono text-xs text-primary-foreground/70">Active</span>
        </div>
        <p className="text-[12.5px] text-primary-foreground/80">Tap to log today's progress →</p>
      </div>
    </Link>
  );
}
