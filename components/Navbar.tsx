"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type User = {
  name: string;
  email: string;
  character: string;
  xp: number;
  streak?: number;
  lastLoginDate?: string | null;
};

const characterImages: Record<string, string> = {
  explorer: "/characters/explorer.png",
  strategist: "/characters/strategist.png",
  dreamer: "/characters/dreamer.png",
  realist: "/characters/realist.png",
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("finstinct-user");
    if (!storedUser) {
      router.replace("/");
    } else {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setChecking(false);
    }
  }, [router]);

  if (checking || !user) return null;

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4 md:gap-6 flex-nowrap">
        {/* Player Info */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
            <Image
              src={characterImages[user.character]}
              alt={user.character}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-bold">{user.name}</p>
            <p className="text-xs text-gray-400 capitalize">
              {user.character}
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-2 md:gap-3 text-sm font-medium flex-nowrap flex-1 justify-center min-w-0">
          <Link
            href="/dashboard"
            className={`px-4 md:px-5 py-1.5 rounded-full border transition whitespace-nowrap flex-shrink-0 ${isActive("/dashboard")
                ? "bg-white/10 text-white border-white/20 shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10 border-transparent"
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/levels"
            className={`px-4 md:px-5 py-1.5 rounded-full border transition whitespace-nowrap flex-shrink-0 ${isActive("/levels")
                ? "bg-white/10 text-white border-white/20 shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10 border-transparent"
              }`}
          >
            Modules
          </Link>
          <Link
            href="/leaderboard"
            className={`px-4 md:px-5 py-1.5 rounded-full border transition whitespace-nowrap flex-shrink-0 ${isActive("/leaderboard")
                ? "bg-white/10 text-white border-white/20 shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10 border-transparent"
              }`}
          >
            Leaderboard
          </Link>
          <Link
            href="/stock-market"
            className={`px-4 md:px-5 py-1.5 rounded-full border transition whitespace-nowrap flex-shrink-0 ${isActive("/stock-market")
                ? "bg-white/10 text-white border-white/20 shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10 border-transparent"
              }`}
          >
            Stock Market
          </Link>
          <Link
            href="/finance-news"
            className={`px-4 md:px-5 py-1.5 rounded-full border transition whitespace-nowrap flex-shrink-0 ${isActive("/finance-news")
                ? "bg-white/10 text-white border-white/20 shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10 border-transparent"
              }`}
          >
            Finance News
          </Link>
        </nav>

        {/* XP and Streak */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-yellow-400/90 text-black px-3 md:px-4 py-1.5 rounded-full font-bold shadow whitespace-nowrap text-xs md:text-sm">
            ⭐ {user.xp} XP
          </div>
          <div className="flex items-center gap-2 bg-orange-500/90 text-white px-3 md:px-4 py-1.5 rounded-full font-bold shadow whitespace-nowrap text-xs md:text-sm">
            🔥 {user.streak || 0} Day Streak
          </div>
        </div>

        {/* Feedback & Logout */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <Link
            href="/feedback"
            className={`px-4 md:px-5 py-1.5 rounded-full border transition whitespace-nowrap text-sm font-medium ${pathname === "/feedback"
                ? "bg-white/10 text-white border-white/20 shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10 border-white/10"
              }`}
          >
            <span className="flex items-center gap-2">
              <span>💬</span>
              <span>Feedback</span>
            </span>
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("finstinct-user");
              router.replace("/");
            }}
            className="text-sm text-red-400 hover:text-red-300 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
