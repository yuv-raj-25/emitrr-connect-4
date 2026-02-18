import { memo } from "react";
import type { LeaderboardEntry } from "@/types/game";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export const Leaderboard = memo(function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-sm text-slate-400 text-center py-4 glass-card rounded-xl">
        No leaderboard data available.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md glass-card rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🏆</span> TOP PLAYERS
      </h2>
      <div className="overflow-hidden rounded-xl border border-slate-700/50">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium text-center">W</th>
              <th className="px-4 py-3 font-medium text-center">L</th>
              <th className="px-4 py-3 font-medium text-center">D</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {entries.map((entry, i) => {
              let rankIcon: React.ReactNode = <span className="text-slate-500 font-mono">#{i + 1}</span>;
              if (i === 0) rankIcon = <span className="text-xl">🥇</span>;
              if (i === 1) rankIcon = <span className="text-xl">🥈</span>;
              if (i === 2) rankIcon = <span className="text-xl">🥉</span>;

              return (
                <tr key={entry.username} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium">{rankIcon}</td>
                  <td className="px-4 py-3 font-medium text-white">{entry.username}</td>
                  <td className="px-4 py-3 text-center text-green-400 font-bold">{entry.wins}</td>
                  <td className="px-4 py-3 text-center text-red-400">{entry.losses}</td>
                  <td className="px-4 py-3 text-center text-slate-400">{entry.draws}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
