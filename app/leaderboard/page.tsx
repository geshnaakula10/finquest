"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getLeaderboard } from "@/lib/api";

type User = {
  name: string;
  email: string;
  character: string;
  xp: number;
  streak?: number;
  lastLoginDate?: string | null;
};

type LeaderboardEntry = {
  name: string;
  xp: number;
  leaderboard_position: number;
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("finstinct-user");
      if (!storedUser) {
        router.replace("/");
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Fetch leaderboard from backend
      try {
        const leaderboardData = await getLeaderboard();
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.warn("Failed to fetch leaderboard, using mock data:", err);
        // Use mock leaderboard data as fallback
        const mockLeaderboard = [
          { name: "Bhavesh", xp: 280, leaderboard_position: 1 },
          { name: "Lasya", xp: 250, leaderboard_position: 2 },
          { name: userData.name, xp: userData.xp || 0, leaderboard_position: 3 },
        ];
        // Sort by XP (descending) and update positions
        mockLeaderboard.sort((a, b) => b.xp - a.xp);
        mockLeaderboard.forEach((entry, index) => {
          entry.leaderboard_position = index + 1;
        });
        setLeaderboard(mockLeaderboard);
      }

      setChecking(false);
    };

    fetchData();
  }, [router]);

  if (checking || !user) return null;

  return (
    <div className="min-h-screen pt-20">
      <Navbar />

      {/* 🏆 Leaderboard Content */}
      <main className="max-w-3xl mx-auto px-6 mt-10">
        <h1 className="text-3xl font-black mb-6 text-center">Leaderboard</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">
          See how you stack up against other Finstinct adventurers.
        </p>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur">
          <div className="grid grid-cols-4 px-4 py-3 text-xs font-semibold text-gray-400 border-b border-white/10">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">XP</span>
            <span className="text-right">Badge</span>
          </div>

          <ul>
            {leaderboard.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-400">
                No players yet. Be the first!
              </li>
            ) : (
              leaderboard.map((entry) => {
                const isCurrentUser = entry.name === user.name;
                return (
                  <li
                    key={entry.leaderboard_position}
                    className={`grid grid-cols-4 px-4 py-3 text-sm items-center ${
                      isCurrentUser
                        ? "bg-yellow-400/5 border-l-4 border-yellow-400"
                        : "border-l-4 border-transparent"
                    }`}
                  >
                    <span className="font-bold text-gray-200">
                      #{entry.leaderboard_position}
                    </span>
                    <span
                      className={`${
                        isCurrentUser ? "text-yellow-300 font-semibold" : "text-gray-200"
                      }`}
                    >
                      {isCurrentUser ? "You" : entry.name}
                    </span>
                    <span className="text-right text-gray-100">
                      {entry.xp} XP
                    </span>
                    <span className="text-right text-xs text-gray-300">
                      {entry.leaderboard_position === 1
                        ? "🥇 Champion"
                        : entry.leaderboard_position === 2
                        ? "🥈 Runner-up"
                        : entry.leaderboard_position === 3
                        ? "🥉 Third"
                        : "⭐ Player"}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
