"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PlayerInfo from "@/components/dashboard/PlayerInfo";
import CircularProgress from "@/components/dashboard/CircularProgress";
import LearningProgress from "@/components/dashboard/LearningProgress";
import FinanceNews from "@/components/dashboard/FinanceNews";
import MiniLeaderboard from "@/components/dashboard/MiniLeaderboard";
import { calculateLevelFromXP } from "@/components/dashboard/ProgressBar";

const API_BASE_URL = "http://127.0.0.1:5000";

const characterImages: Record<string, string> = {
  explorer: "/characters/explorer.png",
  strategist: "/characters/strategist.png",
  dreamer: "/characters/dreamer.png",
  realist: "/characters/realist.png",
};

type User = {
  user_id: string;
  name: string;
  email: string;
  character: string;
  xp: number;
  level: number;
  streak: number;
};

type LeaderboardEntry = {
  name: string;
  xp: number;
  leaderboard_position: number;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      // Step 1: Check localStorage for user_id
      const storedUser = localStorage.getItem("finstinct-user");
      
      if (!storedUser) {
        router.replace("/");
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Step 2: Verify user_id exists
        if (!parsedUser.user_id) {
          console.error("No user_id found in localStorage");
          router.replace("/");
          return;
        }

        console.log("Fetching profile for user_id:", parsedUser.user_id);

        // Step 3: Fetch profile from Flask backend using user_id
        const profileRes = await fetch(
          `${API_BASE_URL}/api/profile?user_id=${parsedUser.user_id}`
        );

        if (!profileRes.ok) {
          const errorText = await profileRes.text();
          throw new Error(`Failed to fetch profile: ${errorText}`);
        }

        const profileData = await profileRes.json();
        console.log("Profile data received:", profileData);

        if (!isMounted) return;

        // Step 4: Set user state with backend data
        setUser({
          user_id: profileData.id || parsedUser.user_id,
          name: profileData.username || "Player",
          email: profileData.email || parsedUser.email,
          character: profileData.character || "explorer",
          xp: profileData.xp || 0,
          level: profileData.level || 1,
          streak: profileData.streak || 1,
        });

        // Step 5: Fetch leaderboard
        const leaderboardRes = await fetch(`${API_BASE_URL}/api/leaderboard`);

        if (!leaderboardRes.ok) {
          throw new Error("Failed to fetch leaderboard");
        }

        const leaderboardData = await leaderboardRes.json();
        console.log("Leaderboard data received:", leaderboardData);

        // Step 6: Format leaderboard data
        const formattedLeaderboard: LeaderboardEntry[] = leaderboardData.map(
          (entry: any, index: number) => ({
            name: entry.username,
            xp: entry.xp,
            leaderboard_position: index + 1,
          })
        );

        if (isMounted) {
          setLeaderboard(formattedLeaderboard);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Dashboard error:", err);
        if (isMounted) {
          setError(err.message || "Failed to load dashboard");
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []); // Empty array - runs once on mount

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.replace("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const currentLevel = calculateLevelFromXP(user.xp);
  const xpForNextLevel = currentLevel * 100;

  return (
    <div className="min-h-screen pt-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* LEFT COLUMN: Player Character */}
          <div className="lg:col-span-3 flex items-start justify-start">
            <div className="w-full space-y-4">
              <PlayerInfo
                name={user.name}
                character={user.character}
                characterImage={characterImages[user.character]}
              />
              {/* Play to Learn Button */}
              <Link
                href="/levels"
                className="block w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 text-black font-bold text-base md:text-lg px-4 py-3 md:py-4 rounded-lg border-2 border-yellow-600/50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl md:text-2xl">🎮</span>
                  <span>Play to Learn</span>
                  <span className="text-lg md:text-xl">→</span>
                </div>
              </Link>
            </div>
          </div>

          {/* CENTER COLUMN: Progress & Learning Progress */}
          <div className="lg:col-span-5 space-y-4 md:space-y-6">
            {/* Player Progression with Circular Progress */}
            <div className="bg-black/40 backdrop-blur border border-white/10 rounded-xl p-5 md:p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-200">Your Progress</h2>
              <CircularProgress
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

            {/* Learning Progress Section */}
            <div className="bg-black/40 backdrop-blur border border-white/10 rounded-xl p-5 md:p-6">
              <LearningProgress currentLevel={currentLevel} />
            </div>

            {/* Mini Leaderboard */}
            <MiniLeaderboard
              entries={leaderboard}
              currentPlayerName={user.name}
            />
          </div>

          {/* RIGHT COLUMN: Finance News */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <FinanceNews />
          </div>
        </div>

        {/* Responsive adjustments for tablet */}
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