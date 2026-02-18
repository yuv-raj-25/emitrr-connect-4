import { useState, memo } from "react";

interface LobbyProps {
  onJoin: (username: string) => void;
  onPlayBot: (username: string) => void;
  onDisconnect: () => void;
  message: string;
  isWaiting: boolean;
  countdown: number | null;
}

export const Lobby = memo(function Lobby({ onJoin, onPlayBot, onDisconnect, message, isWaiting, countdown }: LobbyProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onJoin(username.trim());
  };

  const handleBotPlay = () => {
    if (username.trim()) onPlayBot(username.trim());
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-8 glass-card rounded-2xl w-full">
      <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
        Enter Arena
      </h2>
      
      {!isWaiting ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-center text-lg"
            autoFocus
            maxLength={12}
          />
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-violet-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!username.trim()}
            >
              Find Online Match
            </button>
            <div className="relative flex items-center gap-2 py-2">
              <div className="h-px bg-slate-700 flex-1"></div>
              <span className="text-slate-500 text-xs uppercase tracking-wider">or</span>
              <div className="h-px bg-slate-700 flex-1"></div>
            </div>
            <button
              type="button"
              onClick={handleBotPlay}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
              disabled={!username.trim()}
            >
              Practice vs Bot
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full py-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center font-bold text-violet-400">
                {countdown}
              </div>
            )}
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-slate-300 font-medium animate-pulse">{message}</p>
            {countdown !== null && (
              <p className="text-xs text-slate-500">Auto-matching with bot...</p>
            )}
          </div>

          <button
            onClick={onDisconnect}
            className="text-sm text-red-400 hover:text-red-300 hover:underline mt-2 transition-colors"
          >
            Cancel Search
          </button>
        </div>
      )}
    </div>
  );
});
