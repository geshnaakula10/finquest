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

    // Handle XP changes - update local state and localStorage
    // Only award XP if level hasn't been completed before
    const handleXpChange = useCallback((delta: number) => {
        // Don't award XP if level is already completed
        if (levelCompleted) {
            return;
        }

        setXp(prev => {
            const newXp = Math.max(0, prev + delta);

            // Update XP in localStorage
            const storedUser = localStorage.getItem('finstinct-user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                user.xp = newXp;
                localStorage.setItem('finstinct-user', JSON.stringify(user));
            }

            return newXp;
        });
    }, [levelCompleted]);

    // Mark level as completed when game finishes
    const handleLevelComplete = useCallback(() => {
        if (!levelCompleted) {
            markLevelCompleted(4);
            setLevelCompleted(true);
        }
    }, [levelCompleted]);

    // Load initial XP from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('finstinct-user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setXp(user.xp || 0);
        }
    }, []);

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
