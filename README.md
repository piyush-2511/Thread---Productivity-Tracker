# Personal Productivity Tracker

A mobile-friendly, individual productivity tracker for **todos, habits, challenges, and diet** — with an **AI Coach** that has context on your whole app and can talk through how to actually improve. Designed to cut procrastination and distraction, and help you manage your time, energy, and body with one system.

---

## 🎯 App Introduction

This app is a personal operating system for productivity. It combines:

- **Daily task management** (checklists + one-off todos)
- **Habit building** with streaks
- **Self-created challenges** (30-day style goals)
- **Diet & nutrition planning** — weekly meal plans against daily nutrition targets
- **Energy and screen time awareness**
- **Daily reflection** (thoughts/journaling)
- **Analytics** connecting energy, screen time, nutrition, and actual output
- **AI Coach** — a chat assistant with full context on your data, so you can ask things like *"how can I improve my diet"* or *"what should I cut from my routine to be more productive"*

Everything is logged chronologically, so over time the app becomes a personal record of how you spend your time, energy, attention, and nutrition — and where you can improve.

**Core goal:** Reduce procrastination and distraction, and increase efficiency of time and energy through daily awareness, consistent tracking, and AI-guided reflection.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Charts | Recharts (via shadcn chart components) |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini API (`gemini-3.6-flash`) |
| Theming | `next-themes` (light / dark / system) |
| Hosting/Deployment | Vercel |

---

## 📱 Design Principle: Mobile-Friendly, Not Mobile-Only

The UI is responsive, not phone-locked:

- **< 768px (mobile):** single-column stack, bottom tab nav, one-thumb-reachable actions
- **768–1023px (tablet):** sidebar nav appears, content reflows into a 2-column grid
- **≥ 1024px (desktop):** wider sidebar, 3-column grid, more breathing room
- Forms use bottom sheets/drawers on mobile instead of centered modals
- Touch targets follow a minimum 44×44px tap area
- Same components, same data — layout adapts, nothing is mobile-exclusive

---

## 🎨 Theming

Light, dark, and system modes via `next-themes`, using CSS variables so every component (cards, charts, nav) adapts automatically. Toggle lives in the sidebar on desktop/tablet and in the header on mobile (where the sidebar is hidden).

---

## ✅ Features

### 1. Daily Checklist
Recurring daily tasks, auto-generated each day, with per-task and overall completion rate tracking.

### 2. Todos
One-off tasks with due dates, tags/projects. Quick-capture, overdue tasks auto-surfaced.

### 3. Habits
Daily/weekly frequency, streaks with freeze/grace days, habit stacking.

### 4. Challenges
Time-bound goals (e.g., 30-day) with daily sub-tasks, progress tracking, streaks. *(Nested inside the Habits tab as a sub-view.)*

### 5. Diet & Nutrition
- **Weekly diet plan** — build a template plan per weekday (Mon–Sun), each made of meals (breakfast/lunch/dinner/snacks)
- **Per-meal food items** with nutrition (calories, protein, carbs, fat)
- **Nutrition targets** — daily goals for calories and macros
- **Daily tracking** — today's planned meals surface on the Today screen; check off what you actually ate, with the option to log different-than-planned nutrition
- **Adherence view** — actual vs. target macros, daily and over time

### 6. Energy Tracking
Quick Low/Medium/High check-ins throughout the day.

### 7. Screen Time Logging
Manual daily entry, optional category breakdown, goal/limit with streak.

### 8. Daily Thought/Journal
One free-text entry per day. Taggable, "on this day" resurfacing, quote wall.

### 9. Insights & Analytics
Heatmap calendar, completion trend, energy-vs-time chart, per-habit comparison, streak timelines, challenge progress rings, screen time correlation, **nutrition vs. target chart**.

### 10. AI Coach
- Chat interface with context on your entire app: todos, habits, challenges, diet, energy, screen time, and thoughts
- Ask things like *"how can I improve my diet"*, *"what should I decrease in my lifestyle to increase my productivity"*, *"why did my energy dip this week"*
- Runs on **Google Gemini API (`gemini-3.6-flash`)** — your app builds a compact summary of relevant recent data server-side and sends it as context with each message
- Conversation history persisted per user (`chat_messages` table)
- Accessed via a floating chat button, available from any screen — doesn't take up a nav slot
- **API key stays server-side only** (`GEMINI_API_KEY` env var), never exposed to the browser

### 11. Auth & Profile
Supabase-powered authentication, account settings, theme preference.

---

## 🔄 App Flow

### Navigation
**Bottom tabs (mobile) / Sidebar (tablet+):** `Today` · `Tasks` · `Habits` *(incl. Challenges)* · `Diet` · `Insights`
**Header icon:** Profile/Settings
**Floating button (all screens):** AI Coach chat

### Daily User Loop
```
Open app → Today screen
   ↓
Energy check-in + screen time log
   ↓
Work through checklist, todos, habits, today's meals (1-tap complete)
   ↓
End of day: write a thought/reflection
   ↓
Streaks, completion %, and nutrition totals auto-update
   ↓
Ask the AI Coach how the week is trending, if curious
```

### Screen-by-Screen Overview

**Today (Home)** — Greeting → Energy check-in → Screen time input → Daily checklist → Today's todos → Habits due today → Today's planned meals → Active challenge progress → Daily thought input

**Tasks** — Overdue flagged, all tasks, quick-add bar

**Habits** — List + streaks/heatmaps → sub-tab: Challenges (active challenge cards, progress)

**Diet** — Today's meals (quick log) → Weekly plan builder → Nutrition target settings

**Insights** — Stat cards, heatmap, completion trend, energy chart, habit comparison, screen time correlation, nutrition vs. target chart, thought wall

**AI Coach (chat panel)** — Ask questions, get answers grounded in your actual logged data

---

## 📁 Folder Structure

```
productivity-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (app)/                      # authenticated routes
│   │   ├── today/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── habits/
│   │   │   ├── page.tsx             # includes Challenges sub-tab
│   │   │   └── [id]/page.tsx
│   │   ├── diet/
│   │   │   ├── page.tsx             # today's meals + quick log
│   │   │   └── plan/page.tsx        # weekly plan builder
│   │   ├── insights/page.tsx
│   │   ├── profile/page.tsx
│   │   └── layout.tsx               # sidebar (desktop) / bottom nav (mobile) + AI chat FAB
│   │
│   ├── api/
│   │   ├── habits/route.ts
│   │   ├── todos/route.ts
│   │   ├── challenges/route.ts
│   │   ├── daily-tasks/route.ts
│   │   ├── energy-logs/route.ts
│   │   ├── screen-time/route.ts
│   │   ├── thoughts/route.ts
│   │   ├── diet/route.ts
│   │   └── coach/route.ts           # Gemini API calls happen here (server-only)
│   │
│   ├── layout.tsx                   # root layout, wraps ThemeProvider
│   ├── page.tsx                     # landing/redirect
│   └── globals.css                  # light/dark theme tokens
│
├── components/
│   ├── ui/                          # shadcn components
│   ├── today/
│   │   ├── energy-checkin.tsx
│   │   ├── screen-time-input.tsx
│   │   ├── daily-checklist.tsx
│   │   ├── todo-quick-add.tsx
│   │   ├── habits-due-today.tsx
│   │   ├── diet-today-card.tsx
│   │   ├── challenge-progress-card.tsx
│   │   └── thought-input.tsx
│   ├── habits/
│   │   ├── habit-card.tsx
│   │   ├── habit-form.tsx
│   │   └── habit-heatmap.tsx
│   ├── tasks/
│   │   ├── task-list.tsx
│   │   ├── task-item.tsx
│   │   └── task-form.tsx
│   ├── challenges/
│   │   ├── challenge-card.tsx
│   │   └── challenge-form.tsx
│   ├── diet/
│   │   ├── weekly-plan-editor.tsx
│   │   ├── meal-card.tsx
│   │   ├── meal-form.tsx
│   │   ├── nutrition-target-form.tsx
│   │   └── nutrition-progress-ring.tsx
│   ├── coach/
│   │   ├── chat-fab.tsx             # floating button, all screens
│   │   ├── chat-panel.tsx           # slide-up drawer (mobile) / side panel (desktop)
│   │   ├── chat-bubble.tsx
│   │   └── message-input.tsx
│   ├── insights/
│   │   ├── completion-heatmap.tsx
│   │   ├── completion-trend-chart.tsx
│   │   ├── energy-chart.tsx
│   │   ├── habit-comparison-chart.tsx
│   │   ├── screen-time-chart.tsx
│   │   ├── nutrition-chart.tsx
│   │   └── stat-cards.tsx
│   ├── layout/
│   │   ├── bottom-nav.tsx
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── shared/
│       ├── streak-badge.tsx
│       ├── empty-state.tsx
│       └── loading-skeleton.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── ai/
│   │   ├── gemini-client.ts         # wraps Gemini API calls
│   │   └── context-builder.ts       # aggregates user data into a compact prompt context
│   ├── queries/
│   │   ├── habits.ts
│   │   ├── todos.ts
│   │   ├── challenges.ts
│   │   ├── daily-tasks.ts
│   │   ├── energy.ts
│   │   ├── screen-time.ts
│   │   ├── thoughts.ts
│   │   ├── diet.ts
│   │   └── coach.ts                 # chat history read/write
│   ├── utils/
│   │   ├── streak-calculator.ts
│   │   ├── completion-rate.ts
│   │   └── date-helpers.ts
│   └── types/
│       └── database.types.ts
│
├── hooks/
│   ├── use-habits.ts
│   ├── use-todos.ts
│   ├── use-challenges.ts
│   ├── use-daily-log.ts
│   ├── use-diet.ts
│   └── use-coach-chat.ts
│
├── middleware.ts
├── .env.local                       # includes GEMINI_API_KEY (server-only, never public)
├── components.json
├── tailwind.config.ts
├── supabase-schema.sql
└── package.json
```

---

## 🚧 Development Phases

### Phase 0 — Setup ✅
Auth, Supabase client/server/middleware, base responsive shell (sidebar + bottom nav), theme provider/toggle.

### Phase 1 — Core MVP: Todos + Habits + Daily Checklist ✅
Tables, queries, hooks, components, and pages for the three core daily-loop features. *(Delivered — see the phase-1 code package.)*

### Phase 2 — Challenges + Thoughts
- Tables: `challenges`, `challenge_tasks`, `challenge_logs`, `thoughts`
- Challenges nested as a sub-view inside the Habits tab
- Today screen adds challenge progress + daily thought input

### Phase 3 — Energy + Screen Time
- Tables: `energy_logs`, `screen_time_logs`
- Today screen reaches full v3 daily loop

### Phase 4 — Diet & Nutrition
- Tables: `diet_plan_meals`, `nutrition_targets`, `diet_logs`
- Weekly plan builder, nutrition target form, today's meals card
- `daily_nutrition_summary` view for later charting

### Phase 5 — Insights/Analytics
- Aggregation logic across all logged data (completion, streaks, correlations, nutrition)
- Recharts-based chart components, including the nutrition-vs-target chart

### Phase 6 — AI Coach
- Table: `chat_messages`
- `lib/ai/gemini-client.ts` — calls `gemini-3.6-flash` via the Gemini API, key read from `GEMINI_API_KEY` (server-only)
- `lib/ai/context-builder.ts` — pulls a compact, recent-data summary (todos, habits, diet adherence, energy, screen time) server-side and includes it in the prompt sent to Gemini
- `app/api/coach/route.ts` — the only place the Gemini API is called from; the browser never sees the key
- Chat panel + floating action button, available from every screen

### Phase 7 — Polish
- Streak freeze logic, habit stacking, quote wall, "on this day"
- Empty states, loading skeletons, full mobile responsiveness/touch-target audit
- Deploy to Vercel, environment variables (including `GEMINI_API_KEY`), custom domain

---

## 🗺️ Recommended Build Order

1. **Phase 0–1** ✅ → usable daily loop (auth + todos + habits + checklist)
2. **Phase 2** → challenges and reflection
3. **Phase 3** → energy/screen time awareness
4. **Phase 4** → diet & nutrition tracking
5. **Phase 5** → analytics, once there's real data across all features to visualize
6. **Phase 6** → AI Coach, once there's enough logged data for it to say something useful
7. **Phase 7** → polish and ship

---

## 🔐 AI Coach — Security Notes

- `GEMINI_API_KEY` lives only in `.env.local` / Vercel environment variables — **never** prefixed with `NEXT_PUBLIC_`, so it's never bundled into client-side code
- All Gemini calls happen inside `app/api/coach/route.ts` (a server route), which authenticates the user via Supabase before building context or calling the API
- The context builder should send a **summary** of recent data (e.g., last 7–30 days), not the user's entire raw history, to keep prompts small and costs predictable
- Chat history is stored per-user with RLS, same as every other table

---

## 📌 Notes for Future Features (not yet in scope)
- Browser extension for automatic screen-time tracking
- Native mobile companion app
- Social/accountability sharing for challenges
- Notification/reminder system
- Voice input for the AI Coach