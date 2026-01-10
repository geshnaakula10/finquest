const API_BASE_URL = "http://127.0.0.1:5000"; // Flask backend URL

export type UserProfile = {
  email: string;
  username: string;
  character: string;
  xp: number;
  level: number;
  streak: number;
};

export type AuthResponse = {
  user_id: string;
};

// ---------------- Signup ----------------
export async function signup(
  email: string,
  password: string,
  username: string,
  character: string,
  streak: number,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username, character, streak }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Signup failed");
  }

  const data = await response.json();
  return { user_id: data.user_id };
}

// ---------------- Login ----------------
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Login failed");
  }

  const data = await response.json();
  return { user_id: data.user_id };
}

// ---------------- Get Profile ----------------
export async function getProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch profile");
  }

  return await response.json();
}

// ---------------- Add XP ----------------
export async function addXP(xp: number): Promise<{ xp: number }> {
  const response = await fetch(`${API_BASE_URL}/api/addxp/${xp}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to add XP");
  }

  return await response.json();
}

// ---------------- Change Level ----------------
export async function changeLevel(): Promise<{ level: number }> {
  const response = await fetch(`${API_BASE_URL}/api/changeLevel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to change level");
  }

  return await response.json();
}

// ---------------- Leaderboard ----------------
export async function getLeaderboard(): Promise<
  Array<{ username: string; xp: number; level: number }>
> {
  const response = await fetch(`${API_BASE_URL}/api/leaderboard`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch leaderboard");
  }

  return await response.json();
}
