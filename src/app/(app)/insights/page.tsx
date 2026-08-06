"use client";

import { Header } from "@/components/layout/header";
import { useInsights } from "@/hooks/use-insights";
import { StatCards } from "@/components/insights/stat-cards";
import { CompletionTrendChart } from "@/components/insights/completion-trend-chart";
import { EnergyChart } from "@/components/insights/energy-chart";
import { HabitComparisonChart } from "@/components/insights/habit-comparison-chart";
import { ScreenTimeInsight } from "@/components/insights/screen-time-chart";
import { NutritionChart } from "@/components/insights/nutrition-chart";
import { CompletionHeatmap } from "@/components/insights/completion-heatmap";
import { ThoughtWall } from "@/components/insights/thought-wall";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

function avgEnergyLabel(energyByTime: { bucket: string; avgScore: number }[]): string {
  const scores = energyByTime.map((e) => e.avgScore).filter((s) => s > 0);
  if (scores.length === 0) return "—";
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg >= 67 ? "High" : avg >= 34 ? "Med" : "Low";
}

export default function InsightsPage() {
  const insights = useInsights(30);

  return (
    <>
      <Header eyebrow="Insights" title="Your patterns" sub="Last 30 days, across everything you track." />

      <div className="p-5 md:p-8">
        {insights.loading ? (
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <div className="space-y-4">
            <StatCards
              avgCompletion={insights.avgCompletion}
              bestStreak={insights.bestStreak}
              avgEnergyLabel={avgEnergyLabel(insights.energyByTime)}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="md:col-span-2">
                <CompletionTrendChart data={insights.completion} />
              </div>
              <EnergyChart data={insights.energyByTime} />

              <ScreenTimeInsight
                underGoalAvg={insights.screenTimeCorrelation.underGoalAvg}
                overGoalAvg={insights.screenTimeCorrelation.overGoalAvg}
              />
              <HabitComparisonChart data={insights.habitComparison} />
              <NutritionChart data={insights.nutrition} targetCalories={insights.nutritionTargetCalories} />

              <div className="md:col-span-2 lg:col-span-3">
                <CompletionHeatmap data={insights.completion} />
              </div>

              <ThoughtWall />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
