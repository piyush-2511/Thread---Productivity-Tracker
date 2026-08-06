/**
 * SERVER-ONLY. Estimates nutrition for a free-text food description
 * (e.g. "500g chana", "2 eggs") using Gemini.
 *
 * Token-usage guardrails:
 * - No user context injected — nutrition estimation doesn't need it,
 *   unlike the Coach which does. This alone is the biggest saving.
 * - Strict "JSON only" system instruction + low maxOutputTokens (80) —
 *   this should never need more than ~30 tokens of actual output.
 * - temperature 0.2 — nutrition facts should be consistent, not creative.
 * - No caching here (unlike the greeting) since every food description is
 *   different, but each call is already about as cheap as a Gemini call gets.
 */
import { askGemini } from "@/lib/ai/gemini-client";

export type NutritionEstimate = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

const SYSTEM_INSTRUCTION = `You estimate nutrition for a food description. Respond with ONLY a JSON object,
no markdown fences, no explanation, no other text. Format exactly:
{"calories":number,"protein_g":number,"carbs_g":number,"fat_g":number}
Use your best knowledge of typical nutrition values. Round to whole numbers. If the description includes
a quantity (grams, count, cups, etc.), scale your estimate to that quantity. If no quantity is given,
assume one typical serving.`;

export async function estimateNutrition(foodDescription: string): Promise<NutritionEstimate> {
  const raw = await askGemini({
    systemInstruction: SYSTEM_INSTRUCTION,
    history: [],
    message: foodDescription,
    maxOutputTokens: 80,
    temperature: 0.2,
  });

  // Gemini occasionally wraps JSON in ```json fences despite instructions — strip defensively.
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Could not parse a nutrition estimate for that description. Try rephrasing it.");
  }

  const p = parsed as Partial<NutritionEstimate>;
  if (
    typeof p.calories !== "number" ||
    typeof p.protein_g !== "number" ||
    typeof p.carbs_g !== "number" ||
    typeof p.fat_g !== "number"
  ) {
    throw new Error("Nutrition estimate was incomplete. Try rephrasing the food description.");
  }

  return {
    calories: Math.round(p.calories),
    protein_g: Math.round(p.protein_g),
    carbs_g: Math.round(p.carbs_g),
    fat_g: Math.round(p.fat_g),
  };
}
