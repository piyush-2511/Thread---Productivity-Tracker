import Link from "next/link";
import type { Challenge } from "@/lib/types/database.types";
import { todayISO } from "@/lib/utils/date-helpers";

function dayNumber(challenge: Challenge): number {
  const start = new Date(`${challenge.start_date}T00:00:00`);
  const today = new Date(`${todayISO()}T00:00:00`);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.min(Math.max(diff + 1, 1), challenge.duration_days);
}

export function ChallengeCard({ challenge, percentDone }: { challenge: Challenge; percentDone: number }) {
  const day = dayNumber(challenge);
  const daysLeft = challenge.duration_days - day;

  return (
    <Link href={`/challenges/${challenge.id}`}>
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-[15px] font-medium">{challenge.title}</h2>
          <span className="font-mono text-xs text-primary-foreground/70">
            Day {day}/{challenge.duration_days}
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--accent)) 0% ${percentDone}%, rgba(255,255,255,.15) ${percentDone}% 100%)`,
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-mono text-[11px] text-primary-foreground">
              {percentDone}%
            </div>
          </div>
          <p className="text-[12.5px] leading-relaxed text-primary-foreground/80">
            {daysLeft > 0 ? `${daysLeft} days left` : "Final day"}
          </p>
        </div>
      </div>
    </Link>
  );
}
