-- =========================================================
-- PERSONAL PRODUCTIVITY TRACKER — SUPABASE SCHEMA
-- =========================================================
-- Run this in the Supabase SQL Editor.
-- Assumes Supabase Auth is enabled (auth.users table exists).
-- =========================================================

-- Enable UUID generation (usually already enabled on Supabase)
create extension if not exists "uuid-ossp";

-- =========================================================
-- 1. TODOS
-- =========================================================
create table public.todos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  tag text,
  due_date date,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_todos_user_id on public.todos(user_id);
create index idx_todos_due_date on public.todos(due_date);

-- =========================================================
-- 2. HABITS + HABIT LOGS
-- =========================================================
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  stacked_on_habit_id uuid references public.habits(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  is_completed boolean not null default true,
  is_freeze boolean not null default false, -- grace/freeze day, doesn't break streak
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index idx_habits_user_id on public.habits(user_id);
create index idx_habit_logs_habit_id on public.habit_logs(habit_id);
create index idx_habit_logs_user_id on public.habit_logs(user_id);
create index idx_habit_logs_date on public.habit_logs(log_date);

-- =========================================================
-- 3. DAILY CHECKLIST (recurring daily tasks)
-- =========================================================
create table public.daily_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.daily_task_logs (
  id uuid primary key default uuid_generate_v4(),
  daily_task_id uuid not null references public.daily_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  is_completed boolean not null default true,
  completed_at timestamptz default now(),
  unique (daily_task_id, log_date)
);

create index idx_daily_tasks_user_id on public.daily_tasks(user_id);
create index idx_daily_task_logs_task_id on public.daily_task_logs(daily_task_id);
create index idx_daily_task_logs_date on public.daily_task_logs(log_date);

-- =========================================================
-- 4. CHALLENGES + CHALLENGE TASKS + CHALLENGE LOGS
-- =========================================================
create table public.challenges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_date date not null default current_date,
  duration_days integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.challenge_tasks (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table public.challenge_logs (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  challenge_task_id uuid references public.challenge_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  is_completed boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

create index idx_challenges_user_id on public.challenges(user_id);
create index idx_challenge_tasks_challenge_id on public.challenge_tasks(challenge_id);
create index idx_challenge_logs_challenge_id on public.challenge_logs(challenge_id);
create index idx_challenge_logs_date on public.challenge_logs(log_date);

-- =========================================================
-- 5. THOUGHTS / JOURNAL
-- =========================================================
create table public.thoughts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  tag text check (tag in ('mood', 'quote', 'insight', null)),
  is_pinned boolean not null default false,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_thoughts_user_id on public.thoughts(user_id);
create index idx_thoughts_entry_date on public.thoughts(entry_date);

-- =========================================================
-- 6. ENERGY LOGS
-- =========================================================
create table public.energy_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  energy_level text not null check (energy_level in ('low', 'medium', 'high')),
  logged_at timestamptz not null default now(),
  log_date date not null default current_date
);

create index idx_energy_logs_user_id on public.energy_logs(user_id);
create index idx_energy_logs_date on public.energy_logs(log_date);

-- =========================================================
-- 7. SCREEN TIME LOGS
-- =========================================================
create table public.screen_time_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  minutes integer not null check (minutes >= 0),
  category text, -- e.g. 'social', 'work', 'entertainment' (optional)
  goal_minutes integer, -- optional daily limit set by user
  created_at timestamptz not null default now(),
  unique (user_id, log_date, category)
);

create index idx_screen_time_logs_user_id on public.screen_time_logs(user_id);
create index idx_screen_time_logs_date on public.screen_time_logs(log_date);

-- =========================================================
-- 8. AUTO-UPDATE updated_at TRIGGERS
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_todos_updated_at
before update on public.todos
for each row execute function public.set_updated_at();

create trigger trg_habits_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

-- =========================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =========================================================
-- Enable RLS on every table
alter table public.todos enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.daily_task_logs enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_tasks enable row level security;
alter table public.challenge_logs enable row level security;
alter table public.thoughts enable row level security;
alter table public.energy_logs enable row level security;
alter table public.screen_time_logs enable row level security;

-- ---- TODOS ----
create policy "Users can manage their own todos"
on public.todos for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---- HABITS ----
create policy "Users can manage their own habits"
on public.habits for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own habit logs"
on public.habit_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---- DAILY CHECKLIST ----
create policy "Users can manage their own daily tasks"
on public.daily_tasks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own daily task logs"
on public.daily_task_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---- CHALLENGES ----
create policy "Users can manage their own challenges"
on public.challenges for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- challenge_tasks has no user_id directly, so check via parent challenge
create policy "Users can manage their own challenge tasks"
on public.challenge_tasks for all
using (
  exists (
    select 1 from public.challenges c
    where c.id = challenge_tasks.challenge_id
    and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.challenges c
    where c.id = challenge_tasks.challenge_id
    and c.user_id = auth.uid()
  )
);

create policy "Users can manage their own challenge logs"
on public.challenge_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---- THOUGHTS ----
create policy "Users can manage their own thoughts"
on public.thoughts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---- ENERGY LOGS ----
create policy "Users can manage their own energy logs"
on public.energy_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---- SCREEN TIME LOGS ----
create policy "Users can manage their own screen time logs"
on public.screen_time_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- 10. HELPFUL VIEWS (optional, for analytics queries)
-- =========================================================

-- Overall daily completion rate (todos + habits + daily tasks combined)
create or replace view public.daily_completion_summary
with (security_invoker = true) as
select
  user_id,
  log_date,
  count(*) filter (where is_completed) as completed_count,
  count(*) as total_count,
  round(
    (count(*) filter (where is_completed))::numeric / nullif(count(*), 0) * 100, 1
  ) as completion_rate
from (
  select user_id, log_date, is_completed from public.habit_logs
  union all
  select user_id, log_date, is_completed from public.daily_task_logs
) combined
group by user_id, log_date;

-- =========================================================
-- END OF SCHEMA
-- =========================================================

-- =========================================================
-- 11. DIET & NUTRITION (Phase 4 addition)
-- =========================================================

-- Weekly plan template: one row per meal slot, per weekday.
-- day_of_week: 0 = Sunday ... 6 = Saturday
create table public.diet_plan_meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  calories numeric(6,1) default 0,
  protein_g numeric(6,1) default 0,
  carbs_g numeric(6,1) default 0,
  fat_g numeric(6,1) default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Daily nutrition targets (single row per user, editable anytime)
create table public.nutrition_targets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  target_calories numeric(6,1),
  target_protein_g numeric(6,1),
  target_carbs_g numeric(6,1),
  target_fat_g numeric(6,1),
  updated_at timestamptz not null default now()
);

-- Actual daily log: did the user eat the planned meal today?
-- actual_* fields let them override nutrition if they ate something different.
create table public.diet_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diet_plan_meal_id uuid references public.diet_plan_meals(id) on delete set null,
  log_date date not null default current_date,
  is_eaten boolean not null default true,
  actual_calories numeric(6,1),
  actual_protein_g numeric(6,1),
  actual_carbs_g numeric(6,1),
  actual_fat_g numeric(6,1),
  logged_at timestamptz not null default now()
);

create index idx_diet_plan_meals_user_id on public.diet_plan_meals(user_id);
create index idx_diet_plan_meals_day on public.diet_plan_meals(day_of_week);
create index idx_diet_logs_user_id on public.diet_logs(user_id);
create index idx_diet_logs_date on public.diet_logs(log_date);

alter table public.diet_plan_meals enable row level security;
alter table public.nutrition_targets enable row level security;
alter table public.diet_logs enable row level security;

create policy "Users can manage their own diet plan meals"
on public.diet_plan_meals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own nutrition targets"
on public.nutrition_targets for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own diet logs"
on public.diet_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Daily nutrition summary vs target — feeds the Insights nutrition chart
create or replace view public.daily_nutrition_summary
with (security_invoker = true) as
select
  dl.user_id,
  dl.log_date,
  sum(coalesce(dl.actual_calories, dpm.calories)) filter (where dl.is_eaten) as total_calories,
  sum(coalesce(dl.actual_protein_g, dpm.protein_g)) filter (where dl.is_eaten) as total_protein_g,
  sum(coalesce(dl.actual_carbs_g, dpm.carbs_g)) filter (where dl.is_eaten) as total_carbs_g,
  sum(coalesce(dl.actual_fat_g, dpm.fat_g)) filter (where dl.is_eaten) as total_fat_g
from public.diet_logs dl
left join public.diet_plan_meals dpm on dpm.id = dl.diet_plan_meal_id
group by dl.user_id, dl.log_date;

-- =========================================================
-- END OF DIET ADDITION
-- =========================================================

-- =========================================================
-- 12. AI COACH — CHAT HISTORY (Phase 6 addition)
-- =========================================================
create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_chat_messages_user_id on public.chat_messages(user_id);
create index idx_chat_messages_created_at on public.chat_messages(created_at);

alter table public.chat_messages enable row level security;

create policy "Users can manage their own chat messages"
on public.chat_messages for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- END OF AI COACH ADDITION
-- =========================================================

-- =========================================================
-- 13. AI GREETING CACHE (Phase 7 addition)
-- One row per user per day per time-bucket. Prevents calling the
-- Gemini API more than 4 times/day/user for the greeting line —
-- token usage stays predictable regardless of how often the app
-- is opened.
-- =========================================================
create table public.ai_greetings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  greeting_date date not null default current_date,
  time_bucket text not null check (time_bucket in ('morning', 'afternoon', 'evening', 'night')),
  message text not null,
  created_at timestamptz not null default now(),
  unique (user_id, greeting_date, time_bucket)
);

alter table public.ai_greetings enable row level security;

create policy "Users can manage their own ai greetings"
on public.ai_greetings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- 14. DIET LOGS — ad-hoc entry support (Phase 7 addition)
-- Allows logging food that wasn't part of the weekly plan, with
-- AI-estimated nutrition (see lib/ai/nutrition-estimator.ts).
-- =========================================================
alter table public.diet_logs
  add column if not exists description text,
  add column if not exists meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack'));

comment on column public.diet_logs.description is
  'Free-text food description for ad-hoc entries not linked to a diet_plan_meal, e.g. "500g chana" or "2 eggs".';
