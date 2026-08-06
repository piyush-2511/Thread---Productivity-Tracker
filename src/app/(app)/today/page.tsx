import { Header } from "@/components/layout/header";
import { EnergyCheckin } from "@/components/today/energy-checkin";
import { ScreenTimeInput } from "@/components/today/screen-time-input";
import { DietTodayCard } from "@/components/today/diet-today-card";
import { DailyChecklist } from "@/components/today/daily-checklist";
import { HabitsDueToday } from "@/components/today/habits-due-today";
import { ChallengeProgressCard } from "@/components/today/challenge-progress-card";
import { ThoughtInput } from "@/components/today/thought-input";
import { TaskList } from "@/components/tasks/task-list";
import { TaskBusynessCalendar } from "@/components/tasks/task-busyness-calendar";
import { formatFriendlyDate } from "@/lib/utils/date-helpers";
import { getGreeting } from "@/lib/ai/greeting";

/**
 * Today screen — Phase 7 version. Full daily loop:
 * energy + screen time → checklist/todos/habits → today's meals → challenge → thought.
 * Greeting is fetched server-side (cached, see lib/ai/greeting.ts) so there's no
 * client-side round trip and no extra Gemini call beyond the once-per-time-bucket cache.
 */
export default async function TodayPage() {
  const greeting = await getGreeting();

  return (
    <>
      <Header eyebrow={formatFriendlyDate()} title={greeting} sub="Here's your thread for today." />

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 md:p-8 lg:grid-cols-3">
        <EnergyCheckin />
        <ScreenTimeInput />
        <ChallengeProgressCard />

        <DietTodayCard />
        <DailyChecklist />
        <HabitsDueToday />

        <div className="md:col-span-2 lg:col-span-1">
          <TaskBusynessCalendar />
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <TaskListCard />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <ThoughtInput />
        </div>
      </div>
    </>
  );
}

function TaskListCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-[15px] font-medium">Today's tasks</h2>
      </div>
      <TaskList />
    </div>
  );
}
