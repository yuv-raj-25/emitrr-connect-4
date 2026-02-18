import type { LeaderboardEntry } from "@/types/game";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No leaderboard data yet. Play a game!
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-lg font-semibold text-foreground mb-2">Leaderboard</h2>
      <table className="w-full text-sm border border-border rounded overflow-hidden">
        <thead>
          <tr className="bg-muted text-muted-foreground">
            <th className="text-left px-3 py-2">#</th>
            <th className="text-left px-3 py-2">Player</th>
            <th className="text-center px-3 py-2">W</th>
            <th className="text-center px-3 py-2">L</th>
            <th className="text-center px-3 py-2">D</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.username} className="border-t border-border">
              <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-foreground">{entry.username}</td>
              <td className="px-3 py-2 text-center">{entry.wins}</td>
              <td className="px-3 py-2 text-center">{entry.losses}</td>
              <td className="px-3 py-2 text-center">{entry.draws}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
