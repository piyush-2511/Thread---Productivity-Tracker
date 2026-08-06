"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Diamond, CheckSquare, RotateCw, Utensils, BarChart2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const TABS = [
  { href: "/today", label: "Today", icon: Diamond },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/habits", label: "Habits", icon: RotateCw },
  { href: "/diet", label: "Diet", icon: Utensils },
  { href: "/insights", label: "Insights", icon: BarChart2 },
];

/** Left sidebar nav — visible at md breakpoint and above. */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col bg-primary p-6 text-primary-foreground md:flex lg:w-[250px]">
      <div className="mb-8 pl-1 font-serif text-lg font-medium">◆ Thread</div>

      <nav className="flex flex-1 flex-col gap-1">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] text-primary-foreground/70",
                active && "bg-primary-foreground/10 font-semibold text-primary-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-accent")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-primary-foreground/10 pt-4">
        <span className="text-xs text-primary-foreground/60">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
