"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api"; // Import the login function from your api.ts

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Auto-redirect if already logged in
  useEffect(() => {
    const storedUserId = localStorage.getItem("finstinct-user-id");
    if (storedUserId) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return null; // prevent flicker

  const canLogin = Boolean(email && password);

  const handleLogin = async () => {
    if (!canLogin || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Call the backend login API
      const response = await login(email, password);
      
      // Store user_id in localStorage
      localStorage.setItem("finstinct-user-id", response.user_id);

      // Login successful - redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to login"
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-black/40 backdrop-blur-md rounded-3xl p-8 shadow-xl">
        {/* Title */}
        <h1 className="text-4xl font-black text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Sign in to continue your finance quest
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-400"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canLogin) {
                handleLogin();
              }
            }}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-400"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canLogin) {
                handleLogin();
              }
            }}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!canLogin || loading}
          className={`
            w-full py-4 rounded-full font-extrabold text-lg transition mb-4
            ${
              canLogin && !loading
                ? "bg-green-500 text-black shadow-[0_6px_0_#15803d] hover:translate-y-1"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Signing In..." : "Sign In 🚀"}
        </button>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/"
              className="text-green-400 hover:text-green-300 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}