"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import MapNode from "@/components/MapNode";
import BossNode from "@/components/BossNode";
import PathLine from "@/components/PathLine";

type User = {
  name: string;
  email: string;
  character: string;
};

const characterImages: Record<string, string> = {
  explorer: "/characters/explorer.png",
  strategist: "/characters/strategist.png",
  dreamer: "/characters/dreamer.png",
  realist: "/characters/realist.png",
};

const modules = [
  {
    id: "budgeting",
    title: "Budgeting Basics",
    levels: [1, 2, 3, 4, 5],
  },
  {
    id: "saving",
    title: "Saving & Planning",
    levels: [6, 7, 8, 9, 10],
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const currentLevel = 3; // 🔧 demo value
  const xp = 120;

  // 🔒 Protect dashboard
  useEffect(() => {
    const storedUser = localStorage.getItem("finstinct-user");
    if (!storedUser) {
      router.replace("/");
    } else {
      setUser(JSON.parse(storedUser));
      setChecking(false);
    }
  }, [router]);

  if (checking || !user) return null;

  return (
    <div className="min-h-screen pt-20">
      {/* 🔝 TOP BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Player Info */}
          <div className="flex items-center gap-3">
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

          {/* XP */}
          <div className="flex items-center gap-2 bg-yellow-400/90 text-black px-4 py-1.5 rounded-full font-bold shadow">
            ⭐ {xp} XP
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("finstinct-user");
              router.replace("/");
            }}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🗺️ MAP */}
      <div className="flex flex-col items-center gap-20 mt-10">
        {modules.map((module) => (
          <div key={module.id} className="flex flex-col items-center">
            {/* Module Title */}
            <h2 className="text-2xl font-black mb-10">
              {module.title}
            </h2>

            {/* Levels */}
            <div className="flex flex-col items-center">
              {module.levels.map((level, index) => (
                <div
                  key={level}
                  className={`flex flex-col items-center ${
                    index % 2 === 0 ? "ml-16" : "mr-16"
                  }`}
                >
                  <MapNode
                    label={String(level)}
                    status={
                      level < currentLevel
                        ? "completed"
                        : level === currentLevel
                        ? "current"
                        : "locked"
                    }
                    href={`/level/${level}`}
                  />
                  <PathLine />
                </div>
              ))}

              {/* Boss Fight */}
              <BossNode href={`/boss/${module.id}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
