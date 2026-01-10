'use client';

import { useState, useCallback, useEffect } from 'react';
import RiskHangman from './RiskHangman';
import { isLevelCompleted, markLevelCompleted } from '@/lib/levelCompletion';

export default function Level4() {
    const [xp, setXp] = useState(0);
    const [levelCompleted, setLevelCompleted] = useState(false);

    // Check if level is already completed on mount
    useEffect(() => {
        const completed = isLevelCompleted(4);
        setLevelCompleted(completed);
    }, []);

    // Handle XP changes - update local state, localStorage, and backend
    // Only award XP if level hasn't been completed before
    const handleXpChange = useCallback(async (delta: number) => {
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

            // Sync to backend (fire and forget - don't block UI)
            import('@/lib/api').then(({ addXP }) => {
                addXP(user.user_id, delta).catch(err => {
                    console.error('Failed to sync XP to backend:', err);
                });
            });
        }
    }, [levelCompleted]);

    // Mark level as completed when game finishes
    const handleLevelComplete = useCallback(() => {
        if (!levelCompleted) {
            markLevelCompleted(4);
            setLevelCompleted(true);
        }
    }, [levelCompleted]);

    // Game display XP starts at 0 for this session
    // Total XP is tracked in localStorage and backend

    return (
        <>
            {/* XP Display - Fixed position */}
            <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold shadow-lg z-50">
                ⭐ XP {xp}
            </div>
            <RiskHangman onXpChange={handleXpChange} onLevelComplete={handleLevelComplete} />
        </>
    );
}
