/**
 * Hand-written types matching supabase-schema.sql for Phase 1 tables.
 * Once your Supabase project is live, replace this with generated types:
 *   supabase gen types typescript --project-id <id> > lib/types/database.types.ts
 */

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tag: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: "daily" | "weekly";
  stacked_on_habit_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  is_completed: boolean;
  is_freeze: boolean;
  note: string | null;
  created_at: string;
};

export type DailyTask = {
  id: string;
  user_id: string;
  title: string;
  is_active: boolean;
  created_at: string;
};

export type DailyTaskLog = {
  id: string;
  daily_task_id: string;
  user_id: string;
  log_date: string;
  is_completed: boolean;
  completed_at: string | null;
};

export type Challenge = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  duration_days: number;
  is_active: boolean;
  created_at: string;
};

export type ChallengeTask = {
  id: string;
  challenge_id: string;
  title: string;
  created_at: string;
};

export type ChallengeLog = {
  id: string;
  challenge_id: string;
  challenge_task_id: string | null;
  user_id: string;
  log_date: string;
  is_completed: boolean;
  note: string | null;
  created_at: string;
};

export type Thought = {
  id: string;
  user_id: string;
  content: string;
  tag: "mood" | "quote" | "insight" | null;
  is_pinned: boolean;
  entry_date: string;
  created_at: string;
};

export type EnergyLog = {
  id: string;
  user_id: string;
  energy_level: "low" | "medium" | "high";
  logged_at: string;
  log_date: string;
};

export type ScreenTimeLog = {
  id: string;
  user_id: string;
  log_date: string;
  minutes: number;
  category: string | null;
  goal_minutes: number | null;
  created_at: string;
};

export type DietPlanMeal = {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Sunday ... 6 = Saturday
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sort_order: number;
  created_at: string;
};

export type NutritionTarget = {
  id: string;
  user_id: string;
  target_calories: number | null;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
  updated_at: string;
};

export type DietLog = {
  id: string;
  user_id: string;
  diet_plan_meal_id: string | null;
  log_date: string;
  is_eaten: boolean;
  actual_calories: number | null;
  actual_protein_g: number | null;
  actual_carbs_g: number | null;
  actual_fat_g: number | null;
  description: string | null;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | null;
  logged_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      todos: { Row: Todo; Insert: Partial<Todo>; Update: Partial<Todo> };
      habits: { Row: Habit; Insert: Partial<Habit>; Update: Partial<Habit> };
      habit_logs: { Row: HabitLog; Insert: Partial<HabitLog>; Update: Partial<HabitLog> };
      daily_tasks: { Row: DailyTask; Insert: Partial<DailyTask>; Update: Partial<DailyTask> };
      daily_task_logs: { Row: DailyTaskLog; Insert: Partial<DailyTaskLog>; Update: Partial<DailyTaskLog> };
      challenges: { Row: Challenge; Insert: Partial<Challenge>; Update: Partial<Challenge> };
      challenge_tasks: { Row: ChallengeTask; Insert: Partial<ChallengeTask>; Update: Partial<ChallengeTask> };
      challenge_logs: { Row: ChallengeLog; Insert: Partial<ChallengeLog>; Update: Partial<ChallengeLog> };
      thoughts: { Row: Thought; Insert: Partial<Thought>; Update: Partial<Thought> };
      energy_logs: { Row: EnergyLog; Insert: Partial<EnergyLog>; Update: Partial<EnergyLog> };
      screen_time_logs: { Row: ScreenTimeLog; Insert: Partial<ScreenTimeLog>; Update: Partial<ScreenTimeLog> };
      diet_plan_meals: { Row: DietPlanMeal; Insert: Partial<DietPlanMeal>; Update: Partial<DietPlanMeal> };
      nutrition_targets: { Row: NutritionTarget; Insert: Partial<NutritionTarget>; Update: Partial<NutritionTarget> };
      diet_logs: { Row: DietLog; Insert: Partial<DietLog>; Update: Partial<DietLog> };
      chat_messages: { Row: ChatMessage; Insert: Partial<ChatMessage>; Update: Partial<ChatMessage> };
    };
  };
};
