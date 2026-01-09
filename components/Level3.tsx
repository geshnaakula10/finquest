'use client';

import { useState, useCallback, useEffect } from 'react';
import SaveOrInvestGame from './SaveOrInvestGame';
import { isLevelCompleted, markLevelCompleted } from '@/lib/levelCompletion';

export default function Level3() {
  const [xp, setXp] = useState(0);
  const [levelCompleted, setLevelCompleted] = useState(false);

  // Check if level is already completed on mount
  useEffect(() => {
    const completed = isLevelCompleted(3);
    setLevelCompleted(completed);
  }, []);

  // Handle XP changes - update local state (game display) and localStorage (total XP)
  // Only award XP if level hasn't been completed before
  const handleXpChange = useCallback((delta: number) => {
    // Don't award XP if level is already completed
    if (levelCompleted) {
      return;
    }

    // Update game display XP (starts at 0, accumulates during session)
    setXp(prev => Math.max(0, prev + delta));
    
    // Update total XP in localStorage
    const storedUser = localStorage.getItem('finstinct-user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const currentTotalXp = user.xp || 0;
      const newTotalXp = Math.max(0, currentTotalXp + delta);
      user.xp = newTotalXp;
      localStorage.setItem('finstinct-user', JSON.stringify(user));
    }
  }, [levelCompleted]);

  // Mark level as completed when game finishes
  const handleLevelComplete = useCallback(() => {
    if (!levelCompleted) {
      markLevelCompleted(3);
      setLevelCompleted(true);
    }
  }, [levelCompleted]);

  // Start XP at 0 for the game session
  // XP will accumulate as the user plays

  return (
    <>
      {/* XP Display - Fixed position */}
      <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold shadow-lg z-50">
        ⭐ XP {xp}
      </div>
      <SaveOrInvestGame onXpChange={handleXpChange} onLevelComplete={handleLevelComplete} />
    </>
  );
}

