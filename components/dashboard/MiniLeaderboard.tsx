"use client";

type LeaderboardEntry = {
  name: string;
  xp: number;
  leaderboard_position: number;
};

type MiniLeaderboardProps = {
  entries: LeaderboardEntry[];
  currentPlayerName: string;
};

export default function MiniLeaderboard({
  entries,
  currentPlayerName,
}: MiniLeaderboardProps) {
  // Show top 5 players
  const topPlayers = entries.slice(0, 5);

  return (
    <div className="bg-black/40 backdrop-blur border border-white/10 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">
        Top Players
      </h3>
      {topPlayers.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          No players yet. Be the first!
        </p>
      ) : (
        <div className="space-y-2">
          {topPlayers.map((entry) => {
            const isCurrentPlayer = entry.name === currentPlayerName;
            return (
              <div
                key={entry.leaderboard_position}
                className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                  isCurrentPlayer
                    ? "bg-yellow-400/10 border border-yellow-400/30"
                    : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-6">
                    #{entry.leaderboard_position}
                  </span>
                  <span
                    className={`text-sm ${
                      isCurrentPlayer
                        ? "text-yellow-300 font-semibold"
                        : "text-gray-200"
                    }`}
                  >
                    {isCurrentPlayer ? "You" : entry.name}
                  </span>
                </div>
                <span className="text-xs text-gray-300 font-medium">
                  {entry.xp} XP
                </span>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-gray-500 text-center pt-2">
        Compete with other players and climb the ranks!
      </p>
    </div>
  );
}
