"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FlashCard from "./components/FlashCard";
import Level1Game from "@/components/Level1";
import Level3Game from "@/components/Level3";
import Level4Game from "@/components/Level4";
import FixTheBudget from "@/components/FixTheBudget";
import { level1FlashCards } from "./data/level1";
import { level2Slides } from "./data/level2";
import { markLevelCompleted } from "@/lib/levelCompletion";

export default function LevelPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const currentLevel = parseInt(params.id);
  const nextLevel = currentLevel + 1;
  const levelId = params.id;
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle level completion and XP award
  const handleCompleteLevel = async () => {
    setCompleting(true);
    setError(null);
    
    try {
      await markLevelCompleted(currentLevel);
      // Navigate to next level after successful completion
      router.push(`/level/${nextLevel}`);
    } catch (err) {
      setError("Failed to complete level. Please try again.");
      console.error(err);
      setCompleting(false);
    }
  };

  // Determine which game to show based on level
  const getGameComponent = () => {
    if (currentLevel === 1) {
      return <Level1Game />;
    } else if (currentLevel === 2) {
      return <FixTheBudget />;
    } else if (currentLevel === 3) {
      return <Level3Game />;
    } else if (currentLevel === 4) {
      return <Level4Game />;
    }
    return <p className="p-6">Level coming soon.</p>;
  };

  // For level 3, show game directly (no slides)
  if (params.id === "3") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-4xl space-y-8">
          <header className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
              Level 3
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">Save or Invest?</h1>
            <p className="text-sm md:text-base text-slate-300">
              Practice making smart financial decisions with real-life scenarios.
            </p>
          </header>

          <section className="space-y-6">
            {getGameComponent()}
          </section>

          {error && (
            <div className="text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <section className="flex justify-center pt-4">
            <button
              onClick={handleCompleteLevel}
              disabled={completing}
              className="rounded-full bg-emerald-500 px-6 py-3 text-base font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completing ? "Completing..." : "Complete & Continue →"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  // For Level 4, show game directly
  if (params.id === "4") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-4xl space-y-8">
          <header className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
              Level 4
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">Unlocking Growth</h1>
            <p className="text-sm md:text-base text-slate-300">
              Understand the relationship between risk and return.
            </p>
          </header>

          <section className="space-y-6">
            {getGameComponent()}
          </section>

          {error && (
            <div className="text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <section className="flex justify-center pt-4">
            <button
              onClick={handleCompleteLevel}
              disabled={completing}
              className="rounded-full bg-emerald-500 px-6 py-3 text-base font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completing ? "Completing..." : "Complete & Continue →"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  // Determine which slides to use based on level
  const slides = levelId === "1" ? level1FlashCards : levelId === "2" ? level2Slides : null;

  if (!slides) {
    return <p className="p-6">Level coming soon.</p>;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex];
  const isLastSlide = currentIndex === totalSlides - 1;
  const [mode, setMode] = useState<"slides" | "game">("slides");

  // Level-specific metadata
  const levelMetadata = {
    "1": {
      subtitle: "Level 1",
      title: "Budgeting Basics – Visual Walkthrough",
      description: "Move through each slide to see how budgeting changes the story of your money.",
    },
    "2": {
      subtitle: "Level 2",
      title: "Expenses & Goals – Visual Walkthrough",
      description: "Learn how expenses and financial goals work together to build financial control.",
    },
  };

  const metadata = levelMetadata[levelId as keyof typeof levelMetadata] || levelMetadata["1"];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    if (isLastSlide) {
      setMode("game");
      return;
    }

    setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-8">
        {mode === "slides" && (
          <>
            <header className="text-center space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">
                {metadata.subtitle}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold">
                {metadata.title}
              </h1>
              <p className="text-sm md:text-base text-slate-300">
                {metadata.description}
              </p>
            </header>

            <section className="flex justify-center">
              <FlashCard
                title={currentSlide.title}
                content={currentSlide.content}
                image={currentSlide.image}
              />
            </section>

            <section className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm text-slate-200">
                  Slide {currentIndex + 1} of {totalSlides}
                </span>

                <button
                  onClick={handleNext}
                  className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-300 transition-colors"
                >
                  {isLastSlide ? "Start Mini Game" : "Next"}
                </button>
              </div>
            </section>
          </>
        )}

        {mode === "game" && (
          <>
            <header className="text-center space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
                {metadata.subtitle}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold">
                {levelId === "1" ? "Mini Game" : "Mini Game: Fix the Budget"}
              </h1>
              <p className="text-sm md:text-base text-slate-300">
                Practice what you learned with this quick interactive game.
              </p>
            </header>

            <section className="space-y-6">
              {getGameComponent()}
            </section>

            {error && (
              <div className="text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <section className="flex justify-center pt-4">
              <button
                onClick={handleCompleteLevel}
                disabled={completing}
                className="rounded-full bg-emerald-500 px-6 py-3 text-base font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completing ? "Completing..." : "Complete & Continue →"}
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}