"use client";

import { Fragment, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MapNode from "@/components/MapNode";
import BossNode from "@/components/BossNode";
import PathLine from "@/components/PathLine";
import { updateStreak } from "@/lib/streak";
import {
  modules,
  getLevelDescription,
  type Module,
} from "@/lib/moduleConfig";

type User = {
  name: string;
  email: string;
  character: string;
  xp: number;
  streak?: number;
  lastLoginDate?: string | null;
  completedLevels?: number[];
};

function LevelsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const selectedModuleId = searchParams.get("module");

  // Get selected module
  const selectedModule = selectedModuleId
    ? modules.find((m) => m.id === selectedModuleId)
    : null;

  // Calculate current level based on XP (100 XP per level)
  // Level 1: 0-99, Level 2: 100-199, etc.
  const calculateCurrentLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1;
  };

  // Get completed levels from user data or calculate from XP
  const getCompletedLevels = (user: User): number[] => {
    if (user.completedLevels) {
      return user.completedLevels;
    }
    // Fallback: calculate from XP
    const currentLevel = calculateCurrentLevel(user.xp);
    const completed: number[] = [];
    for (let i = 1; i < currentLevel; i++) {
      completed.push(i);
    }
    return completed;
  };

  // Check if a level is completed
  const isLevelCompleted = (level: number, completedLevels: number[]): boolean => {
    return completedLevels.includes(level);
  };

  // 🔒 Protect page and update streak
  useEffect(() => {
    const storedUser = localStorage.getItem("finstinct-user");
    if (!storedUser) {
      router.replace("/");
    } else {
      // Update streak on login
      const { streak, isNewDay } = updateStreak();
      const userData = JSON.parse(storedUser);
      userData.streak = streak;
      setUser(userData);
      setChecking(false);

      // Show streak notification if it's a new day
      if (isNewDay && streak > 1) {
        // Optional: Could show a toast notification here
      }
    }
  }, [router]);

  if (checking || !user) return null;

  const currentLevel = calculateCurrentLevel(user.xp);
  const completedLevels = getCompletedLevels(user);

  // Module List View
  if (!selectedModule) {
    return (
      <div className="min-h-screen pt-20">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-black mb-8 text-center">Map</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module) => (
              <Link
                key={module.id}
                href={`/levels?module=${module.id}`}
                className="block p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:border-white/20"
              >
                <h2 className="text-xl font-bold mb-2">{module.title}</h2>
                <p className="text-sm text-gray-300">{module.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Module Level Map View
  return (
    <div className="min-h-screen pt-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/levels"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
        >
          ← Back to Modules
        </Link>

        {/* Module Title */}
        <h2 className="text-2xl font-black mb-4">{selectedModule.title}</h2>
        <p className="text-sm text-gray-300 mb-10">{selectedModule.description}</p>

        {/* 🗺️ MAP */}
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <div className="relative w-full max-w-5xl flex flex-col items-stretch px-4 md:px-8">
            {selectedModule.levels.map((level, index) => {
              const isLast = index === selectedModule.levels.length - 1;
              const side = index % 2 === 0 ? "left" : "right";
              const nextSide = (index + 1) % 2 === 0 ? "left" : "right";

              const levelDesc = getLevelDescription(level);
              const completed = isLevelCompleted(level, completedLevels);

              // All nodes are yellow by default, green when completed
              const status = completed ? "completed" : "default";

              return (
                <Fragment key={level}>
                  {/* Node row */}
                  <div className="flex justify-between items-start gap-4 md:gap-8">
                    <div className="flex-1 flex justify-start min-w-0">
                      {side === "left" && (
                        <div className="flex items-start gap-4 md:gap-6 w-full">
                          <div className="flex-shrink-0">
                            <MapNode
                              label={String(level)}
                              status={status}
                              href={`/level/${level}`}
                            />
                          </div>
                          {levelDesc && (
                            <div className="flex-1 min-w-0 max-w-md">
                              <p className="text-base md:text-lg font-bold text-white mb-2">
                                {levelDesc.title}
                              </p>
                              <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                                {levelDesc.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex justify-end min-w-0">
                      {side === "right" && (
                        <div className="flex items-start gap-4 md:gap-6 flex-row-reverse w-full">
                          <div className="flex-shrink-0">
                            <MapNode
                              label={String(level)}
                              status={status}
                              href={`/level/${level}`}
                            />
                          </div>
                          {levelDesc && (
                            <div className="flex-1 min-w-0 max-w-md text-right">
                              <p className="text-base md:text-lg font-bold text-white mb-2">
                                {levelDesc.title}
                              </p>
                              <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                                {levelDesc.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector to next node */}
                  {!isLast && (
                    <div className="h-20 md:h-24 my-2">
                      <PathLine
                        status={status}
                        fromSide={side}
                        toSide={nextSide}
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}

            {/* Boss Fight */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <BossNode
                href={`/boss/${selectedModule.id}`}
                locked={
                  !selectedModule.levels.every((lvl) =>
                    isLevelCompleted(lvl, completedLevels)
                  )
                }
                showTooltip={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LevelsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20"><Navbar /><div className="flex items-center justify-center h-screen">Loading...</div></div>}>
      <LevelsPageContent />
    </Suspense>
  );
}
