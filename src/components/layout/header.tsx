import { ThemeToggle } from "@/components/theme-toggle";

export function Header({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <header className="rounded-b-[22px] bg-primary px-5 py-6 text-primary-foreground md:rounded-bl-[28px] md:rounded-br-none md:px-10 md:py-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-primary-foreground/60">
            {eyebrow}
          </div>
          <h1 className="font-serif text-2xl font-medium leading-tight md:text-[28px]">{title}</h1>
          {sub && <p className="mt-1.5 text-sm text-primary-foreground/70">{sub}</p>}
        </div>
        {/* Theme toggle also lives here for mobile, where the sidebar (and its toggle) is hidden */}
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
