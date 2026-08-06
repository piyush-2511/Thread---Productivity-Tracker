"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ChallengeForm } from "@/components/challenges/challenge-form";
import { useChallenges } from "@/hooks/use-challenges";

export default function NewChallengePage() {
  const router = useRouter();
  const { addChallenge } = useChallenges();

  async function handleSubmit(input: { title: string; description?: string; duration_days: number; taskTitles: string[] }) {
    const created = await addChallenge(input);
    router.push(`/challenges/${created.id}`);
  }

  return (
    <>
      <Header eyebrow="New challenge" title="Create a challenge" sub="Name it, set a duration, and define what 'done' looks like each day." />
      <div className="p-5 md:p-8">
        <div className="max-w-md rounded-2xl border border-border bg-card p-5">
          <ChallengeForm onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
}
