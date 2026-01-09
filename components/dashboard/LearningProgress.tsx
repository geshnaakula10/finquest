"use client";

import { useEffect, useState } from "react";
import { getCompletedLevels } from "@/lib/levelCompletion";
import { modules } from "@/lib/moduleConfig";

type LearningProgressProps = {
  currentLevel: number;
};

export default function LearningProgress({ currentLevel }: LearningProgressProps) {
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  useEffect(() => {
    setCompletedLevels(getCompletedLevels());
  }, []);

  // Calculate progress for each module
  const moduleProgress = modules.map((module) => {
    const completedInModule = module.levels.filter((level) =>
      completedLevels.includes(level)
    ).length;
    const totalInModule = module.levels.length;
    const progressPercent = totalInModule > 0 
      ? Math.round((completedInModule / totalInModule) * 100) 
      : 0;

    return {
      ...module,
      completed: completedInModule,
      total: totalInModule,
      progressPercent,
    };
  });

  // Calculate overall progress
  const totalLevels = modules.reduce((sum, m) => sum + m.levels.length, 0);
  const totalCompleted = completedLevels.length;
  const overallProgress = totalLevels > 0 
    ? Math.round((totalCompleted / totalLevels) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-200 mb-4">Learning Progress</h2>
      
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Overall Progress</span>
          <span className="text-sm font-bold text-yellow-400">
            {totalCompleted} / {totalLevels} Levels
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-center">
          {overallProgress}% Complete
        </p>
      </div>

      {/* Module Progress List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {moduleProgress.map((module) => (
          <div
            key={module.id}
            className="bg-black/20 border border-white/5 rounded-lg p-3 hover:bg-black/30 transition"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {module.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {module.completed} / {module.total} levels completed
                </p>
              </div>
              <span className="text-xs font-bold text-yellow-400 ml-2">
                {module.progressPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${module.progressPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

