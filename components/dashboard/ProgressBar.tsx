"use client";

type ProgressBarProps = {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
};

/**
 * Calculate minimum XP required to reach a level
 * Formula: (level - 1) * 100
 * Level 1: 0 XP, Level 2: 100 XP, Level 3: 200 XP, etc.
 */
function calculateXPForLevel(level: number): number {
  return (level - 1) * 100;
}

/**
 * Calculate current level based on total XP
 * Level 1: 0-99 XP, Level 2: 100-199 XP, Level 3: 200-299 XP, etc.
 */
export function calculateLevelFromXP(totalXP: number): number {
  if (totalXP < 0) return 1;
  return Math.floor(totalXP / 100) + 1;
}

export default function ProgressBar({
  currentLevel,
  currentXP,
  xpForNextLevel,
}: ProgressBarProps) {
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpProgress = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold">Level {currentLevel}</span>
        <span className="text-xs text-gray-400">
          {xpProgress} / {xpNeeded} XP
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 text-center">
        {Math.round(xpNeeded - xpProgress)} XP until Level {currentLevel + 1}
      </p>
    </div>
  );
}
