import { addXP, getProfile } from "./api";

/**
 * Utility functions for tracking level completion
 */

// XP rewards per level (you can customize these)
const LEVEL_XP_REWARDS: Record<number, number> = {
  1: 50,
  2: 75,
  3: 100,
  4: 125,
  5: 150,
  // Add more levels as needed
};

// Default XP if level not in rewards map
const DEFAULT_LEVEL_XP = 100;

// Track pending completions to prevent duplicate requests
const pendingCompletions = new Set<number>();

/**
 * Get XP reward for a specific level
 */
function getLevelXPReward(levelId: number): number {
  return LEVEL_XP_REWARDS[levelId] || DEFAULT_LEVEL_XP;
}

/**
 * Check if a level has been completed
 */
export function isLevelCompleted(levelId: number): boolean {
  const storedUser = localStorage.getItem("finstinct-user");
  if (!storedUser) return false;

  const user = JSON.parse(storedUser);
  const completedLevels = user.completedLevels || [];
  return completedLevels.includes(levelId);
}

/**
 * Mark a level as completed and award XP
 * This function ensures only ONE request is sent per level completion
 */
export async function markLevelCompleted(levelId: number): Promise<void> {
  const storedUser = localStorage.getItem("finstinct-user");
  if (!storedUser) {
    throw new Error("User not logged in");
  }
  
  const user = JSON.parse(storedUser);
  const storedUserId = user.user_id;
  if (!storedUserId) {
    throw new Error("User ID not found");
  }

  // Check if already processing this level
  if (pendingCompletions.has(levelId)) {
    console.log(`Level ${levelId} completion already in progress, skipping duplicate request`);
    return;
  }

  // Check if level is already completed (don't award XP twice)
  if (isLevelCompleted(levelId)) {
    console.log(`Level ${levelId} already completed`);
    return;
  }

  // Mark as pending
  pendingCompletions.add(levelId);

  try {
    console.log("Attempting to complete level:", levelId);
    console.log("User ID:", storedUserId);

    // Get XP reward for this level
    const xpReward = getLevelXPReward(levelId);
    console.log(`Awarding ${xpReward} XP for level ${levelId}`);

    // Add XP to database
    const result = await addXP(storedUserId, xpReward);
    console.log("XP update result:", result);

    // Fetch updated profile from backend to get all current data
    try {
      const profile = await getProfile(storedUserId);

      // Update local storage with fresh data from backend
      const storedUser = localStorage.getItem("finstinct-user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const completedLevels = user.completedLevels || [];

        // Merge backend data with local completion tracking
        const updatedUser = {
          ...user,
          xp: profile.xp,
          level: profile.level,
          completedLevels: [...completedLevels, levelId]
        };

        localStorage.setItem("finstinct-user", JSON.stringify(updatedUser));
        console.log("Updated user data:", updatedUser);
      }
    } catch (profileError) {
      console.error("Failed to fetch updated profile:", profileError);
      // Fallback: just update XP locally
      const storedUser = localStorage.getItem("finstinct-user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const completedLevels = user.completedLevels || [];

        user.completedLevels = [...completedLevels, levelId];
        user.xp = result.xp;

        localStorage.setItem("finstinct-user", JSON.stringify(user));
      }
    }

    console.log(`✅ Level ${levelId} completed! Earned ${xpReward} XP. Total XP: ${result.xp}`);
  } catch (error) {
    console.error("Failed to mark level as completed:", error);
    throw error;
  } finally {
    // Remove from pending set
    pendingCompletions.delete(levelId);
  }
}

/**
 * Get all completed levels
 */
export function getCompletedLevels(): number[] {
  const storedUser = localStorage.getItem("finstinct-user");
  if (!storedUser) return [];

  const user = JSON.parse(storedUser);
  return user.completedLevels || [];
}