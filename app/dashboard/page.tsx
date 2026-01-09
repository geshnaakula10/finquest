"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PlayerInfo from "@/components/dashboard/PlayerInfo";
import ProgressBar, { calculateLevelFromXP } from "@/components/dashboard/ProgressBar";
import FinanceNews from "@/components/dashboard/FinanceNews";
import MiniLeaderboard from "@/components/dashboard/MiniLeaderboard";
import { getProfile, getLeaderboard, type UserProfile } from "@/lib/api";
import { updateStreak } from "@/lib/streak";

type User = {
  name: string;
  email: string;
  character: string;
  xp: number;
  streak?: number;
  lastLoginDate?: string | null;
  id?: string;
  accessToken?: string;
};

const characterImages: Record<string, string> = {
  explorer: "/characters/explorer.png",
  strategist: "/characters/strategist.png",
  dreamer: "/characters/dreamer.png",
  realist: "/characters/realist.png",
};

type LeaderboardEntry = {
  name: string;
  xp: number;
  leaderboard_position: number;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Protect dashboard and fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const storedUser = localStorage.getItem("finstinct-user");
      if (!storedUser) {
        router.replace("/");
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        
        // Update streak on login
        const { streak, isNewDay } = updateStreak();
        userData.streak = streak;
        
        // Try to fetch from backend if we have access token
        let profileData: UserProfile | null = null;
        if (userData.id && userData.accessToken) {
          try {
            profileData = await getProfile(userData.id, userData.accessToken);
            // Update user data with backend data
            userData.xp = profileData.xp;
            userData.name = profileData.name;
            userData.character = profileData.role;
          } catch (err) {
            console.warn("Failed to fetch profile from backend, using local data:", err);
            // Continue with local data
          }
        }

        setUser(userData);

        // Fetch leaderboard
        try {
          const leaderboardData = await getLeaderboard();
          setLeaderboard(leaderboardData);
        } catch (err) {
          console.warn("Failed to fetch leaderboard, using mock data:", err);
          // Use mock leaderboard data as fallback
          setLeaderboard([
            { name: "Bhavesh", xp: 280, leaderboard_position: 1 },
            { name: "Lasya", xp: 250, leaderboard_position: 2 },
            { name: userData.name, xp: userData.xp || 0, leaderboard_position: 3 },
          ]);
        }

        setChecking(false);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        setChecking(false);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (checking) return null;

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate current level from XP
  const currentLevel = calculateLevelFromXP(user.xp);
  // XP needed for next level: currentLevel * 100 (e.g., Level 2 needs 100 XP, Level 3 needs 200 XP)
  const xpForNextLevel = currentLevel * 100;

  return (
    <div className="min-h-screen pt-20">
      <Navbar />

      {/* Main Dashboard Content */}
      {/* Optimized layout: Reduced padding, better space utilization */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* LEFT COLUMN: Player Character (Hero Style) */}
          {/* Reduced column width to allow center/right sections to expand */}
          <div className="lg:col-span-3 flex items-start justify-start">
            <div className="w-full">
              <PlayerInfo
                name={user.name}
                character={user.character}
                characterImage={characterImages[user.character]}
              />
            </div>
          </div>

          {/* CENTER COLUMN: Progress & News (Expanded) */}
          {/* Increased column span for better space utilization */}
          <div className="lg:col-span-5 space-y-4 md:space-y-6">
            {/* Player Progression - Compact but clear */}
            <div className="bg-black/40 backdrop-blur border border-white/10 rounded-xl p-5 md:p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-200">Your Progress</h2>
              <ProgressBar
                currentLevel={currentLevel}
                currentXP={user.xp}
                xpForNextLevel={xpForNextLevel}
              />
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total XP</span>
                  <span className="text-yellow-400 font-bold">{user.xp} XP</span>
                </div>
                {user.streak && user.streak > 0 && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">Streak</span>
                    <span className="text-orange-400 font-bold">
                      🔥 {user.streak} Days
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Finance News - Expanded and more prominent */}
            <FinanceNews />
          </div>

          {/* RIGHT COLUMN: Mini Leaderboard (Expanded) */}
          {/* Increased column span for better visibility */}
          <div className="lg:col-span-4">
            <MiniLeaderboard
              entries={leaderboard}
              currentPlayerName={user.name}
            />
          </div>
        </div>

        {/* Responsive adjustments for tablet */}
        {/* Improved spacing for smaller screens */}
        <div className="mt-4 md:mt-6 lg:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FinanceNews />
            <MiniLeaderboard
              entries={leaderboard}
              currentPlayerName={user.name}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
