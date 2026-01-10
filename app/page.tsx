"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { signup } from "@/lib/api";

const characters = [
  { id: "explorer", label: "Explorer", image: "/characters/explorer.png" },
  { id: "strategist", label: "Strategist", image: "/characters/strategist.png" },
  { id: "dreamer", label: "Dreamer", image: "/characters/dreamer.png" },
  { id: "realist", label: "Realist", image: "/characters/realist.png" },
];

export default function Home() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [character, setCharacter] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Auto-redirect if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("finstinct-user");
    if (storedUser) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, []); // ✅ Fixed: Empty dependency array

  if (checking) return null; // prevent flicker

  const canStart = Boolean(name && email && password && character);

  const handleStart = async () => {
    if (!canStart || loading) return;

    setLoading(true);
    setError(null);

    try {
      const streak = 1;
      const { user_id } = await signup(email, password, name, character!, streak);
      
      // Store user data in localStorage
      const user = {
        user_id,
        name,
        email,
        character: character!,
        xp: 0,
        streak: 1,
        lastLoginDate: new Date().toISOString(),
      };

      localStorage.setItem("finstinct-user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create account"
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-black/40 backdrop-blur-md rounded-3xl p-8 shadow-xl">
        {/* Title */}
        <h1 className="text-4xl font-black text-center mb-2">
          Finance Quest
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Learn money skills by playing
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a secure password"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-400"
          />
          <p className="mt-1 text-xs text-gray-400">
            This is just for this device; do not reuse important passwords.
          </p>
        </div>

        {/* Character Selection */}
        <h2 className="text-lg font-bold mb-4 text-center">
          Choose Your Character
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {characters.map((c) => (
            <button
              key={c.id}
              onClick={() => setCharacter(c.id)}
              className={`
                rounded-2xl p-4 flex flex-col items-center gap-3
                border-2 transition
                ${
                  character === c.id
                    ? "border-green-400 bg-green-400/10 scale-105"
                    : "border-gray-700 hover:border-gray-500"
                }
              `}
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-800">
                <Image
                  src={c.image}
                  alt={c.label}
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>

              <span className="font-bold">{c.label}</span>
            </button>
          ))}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!canStart || loading}
          className={`
            w-full py-4 rounded-full font-extrabold text-lg transition mb-4
            ${
              canStart && !loading
                ? "bg-green-500 text-black shadow-[0_6px_0_#15803d] hover:translate-y-1"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Creating Account..." : "Start Adventure 🚀"}
        </button>

        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green-400 hover:text-green-300 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}