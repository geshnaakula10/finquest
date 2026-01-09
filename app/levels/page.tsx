"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MapNode from "@/components/MapNode";
import BossNode from "@/components/BossNode";
import PathLine from "@/components/PathLine";
import { updateStreak } from "@/lib/streak";

type User = {
  name: string;
  email: string;
  character: string;
  xp: number;
  streak?: number;
  lastLoginDate?: string | null;
};

const modules = [
  {
    id: "budgeting",
    title: "Budgeting Basics",
    levels: [1, 2, 3, 4, 5],
  },
  {
    id: "saving",
    title: "Saving & Planning",
    levels: [6, 7, 8, 9, 10],
  },
];

export default function LevelsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  // 🔧 Demo progression: currently on level 3
  // TODO: Calculate current level based on XP or backend data
  const currentLevel = 3;

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

  return (
    <div className="min-h-screen pt-20">
      <Navbar />

      {/* 🗺️ MAP */}
      <div className="flex flex-col items-center gap-20 mt-10">
        {modules.map((module) => (
          <div key={module.id} className="flex flex-col items-center">
            {/* Module Title */}
            <h2 className="text-2xl font-black mb-10">
              {module.title}
            </h2>

            {/* Levels */}
            <div className="flex flex-col items-center">
              <div className="relative w-[260px] flex flex-col items-stretch">
                {module.levels.map((level, index) => {
                  const isLast = index === module.levels.length - 1;
                  const side = index % 2 === 0 ? "left" : "right";
                  const nextSide = (index + 1) % 2 === 0 ? "left" : "right";

                  const status =
                    level < currentLevel
                      ? "completed"
                      : level === currentLevel
                        ? "current"
                        : "locked";

                  return (
                    <Fragment key={level}>
                      {/* Node row */}
                      <div className="flex justify-between items-center">
                        <div className="flex-1 flex justify-start">
                          {side === "left" && (
                            <MapNode
                              label={String(level)}
                              status={status}
                              href={`/level/${level}`}
                            />
                          )}
                        </div>
                        <div className="flex-1 flex justify-end">
                          {side === "right" && (
                            <MapNode
                              label={String(level)}
                              status={status}
                              href={`/level/${level}`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Connector to next node */}
                      {!isLast && (
                        <div className="h-16">
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
                <div className="mt-6 flex justify-center">
                  <BossNode
                    href={`/boss/${module.id}`}
                    locked={
                      !module.levels.every((lvl) => lvl < currentLevel)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
