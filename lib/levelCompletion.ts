/**
 * Utility functions for tracking level completion
 */

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
 * Mark a level as completed
 */
export function markLevelCompleted(levelId: number): void {
  const storedUser = localStorage.getItem("finstinct-user");
  if (!storedUser) return;
  
  const user = JSON.parse(storedUser);
  const completedLevels = user.completedLevels || [];
  
  // Only add if not already completed
  if (!completedLevels.includes(levelId)) {
    user.completedLevels = [...completedLevels, levelId];
    localStorage.setItem("finstinct-user", JSON.stringify(user));
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

