import { useState } from "react";

interface LobbyProps {
  onJoin: (username: string) => void;
  onDisconnect: () => void;
  message: string;
  isWaiting: boolean;
  countdown: number | null;
}

export function Lobby({ onJoin, onDisconnect, message, isWaiting, countdown }: LobbyProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onJoin(username.trim());
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-foreground">4 in a Row</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      {!isWaiting && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
            autoFocus
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90"
          >
            Play
          </button>
        </form>
      )}
      {isWaiting && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm text-muted-foreground animate-pulse">
            Searching for opponent...
            {countdown !== null && countdown > 0 && (
              <span className="ml-1">(bot joins in {countdown}s)</span>
            )}
            {countdown === 0 && (
              <span className="ml-1">(bot joining...)</span>
            )}
          </div>
          <button
            onClick={onDisconnect}
            className="text-xs text-destructive underline hover:opacity-80"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

