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

/** Small helper so every table entry gets the same shape without repeating Relationships each time. */
type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      todos: TableDef<Todo>;
      habits: TableDef<Habit>;
      habit_logs: TableDef<HabitLog>;
      daily_tasks: TableDef<DailyTask>;
      daily_task_logs: TableDef<DailyTaskLog>;
      challenges: TableDef<Challenge>;
      challenge_tasks: TableDef<ChallengeTask>;
      challenge_logs: TableDef<ChallengeLog>;
      thoughts: TableDef<Thought>;
      energy_logs: TableDef<EnergyLog>;
      screen_time_logs: TableDef<ScreenTimeLog>;
      diet_plan_meals: TableDef<DietPlanMeal>;
      nutrition_targets: TableDef<NutritionTarget>;
      diet_logs: TableDef<DietLog>;
      chat_messages: TableDef<ChatMessage>;
      ai_greetings: TableDef<{
        id: string;
        user_id: string;
        greeting_date: string;
        time_bucket: "morning" | "afternoon" | "evening" | "night";
        message: string;
        created_at: string;
      }>;
    };
    Views: {
      daily_completion_summary: {
        Row: {
          user_id: string;
          log_date: string;
          completed_count: number;
          total_count: number;
          completion_rate: number;
        };
        Relationships: [];
      };
      daily_nutrition_summary: {
        Row: {
          user_id: string;
          log_date: string;
          total_calories: number | null;
          total_protein_g: number | null;
          total_carbs_g: number | null;
          total_fat_g: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
