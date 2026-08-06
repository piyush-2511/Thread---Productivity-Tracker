import { Header } from "@/components/layout/header";
import { TaskList } from "@/components/tasks/task-list";

export default function TasksPage() {
  return (
    <>
      <Header eyebrow="Tasks" title="All tasks" sub="One-off todos, grouped by status." />
      <div className="p-5 md:p-8">
        <TaskList />
      </div>
    </>
  );
}
