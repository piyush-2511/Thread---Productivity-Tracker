"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Diamond, CheckSquare, RotateCw, Utensils, BarChart2 } from "lucide-react";

const TABS = [
  { href: "/today", label: "Today", icon: Diamond },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/habits", label: "Habits", icon: RotateCw },
  { href: "/diet", label: "Diet", icon: Utensils },
  { href: "/insights", label: "Insights", icon: BarChart2 },
];

/** Bottom tab bar — visible below the md breakpoint only. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card px-2 pb-3 pt-2 md:hidden">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-mono text-muted-foreground",
              active && "font-semibold text-foreground"
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", active && "text-accent")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
