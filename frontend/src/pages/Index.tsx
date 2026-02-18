import { useState } from "react";
import { useGameSocket } from "@/hooks/useGameSocket";
import { Lobby } from "@/components/Lobby";
import { GameBoard } from "@/components/GameBoard";
import { Leaderboard } from "@/components/Leaderboard";

const Index = () => {
  const {
    board, currentPlayer, playerNumber, status,
    opponentName, gameId, leaderboard, message,
    countdown, winningCells, connect, playBot, dropDisc, playAgain, disconnect,
    winner,
  } = useGameSocket();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const isInGame = status === "playing";
  const isGameOver = status === "won" || status === "draw" || status === "forfeited";
  const isWaiting = status === "waiting" && message.includes("Waiting");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-4xl flex flex-col gap-8 items-center">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 drop-shadow-sm">
            4 In A Row
          </h1>
          <p className="text-muted-foreground text-lg">Online Multiplayer Strategy Game</p>
        </div>

        {/* Lobby / Username Entry */}
        {!isInGame && !isGameOver && (
          <div className="w-full max-w-md">
            <Lobby
              onJoin={connect}
              onPlayBot={playBot}
              onDisconnect={disconnect}
              message={message}
              isWaiting={isWaiting}
              countdown={countdown}
            />
          </div>
        )}

        {/* Game Board */}
        {(isInGame || isGameOver) && (
          <div className="flex flex-col items-center gap-6 animate-accordion-down">
            <div className="flex items-center gap-4 text-sm px-4 py-2 rounded-full glass">
              <span className="text-muted-foreground">vs</span>
              <strong className="text-lg text-foreground">{opponentName}</strong>
              {gameId && <span className="text-xs text-muted-foreground opacity-50 ml-2">#{gameId.slice(0, 4)}</span>}
            </div>
            
            <GameBoard
              board={board}
              currentPlayer={currentPlayer}
              playerNumber={playerNumber}
              onDropDisc={dropDisc}
              disabled={isGameOver}
              winningCells={winningCells}
            />
          </div>
        )}

        {/* Game Over Actions */}
        {isGameOver && (
          <div className="flex flex-col items-center gap-6 animate-bounce-in">
            {status === "won" && winner && (
              <div className="text-center">
                <p className="text-4xl font-bold drop-shadow-md" style={{ color: message.includes("You win") ? "#4ade80" : "#f87171" }}>
                  {message.includes("You win") ? "🎉 Victory! 🎉" : "� Defeat"}
                </p>
              </div>
            )}
            {status === "draw" && (
              <div className="text-center">
                <p className="text-4xl font-bold text-yellow-400 drop-shadow-md">🤝 It's a Draw!</p>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={playAgain}
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold text-lg"
              >
                Play Again
              </button>
              <button
                onClick={disconnect}
                className="px-8 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard Toggle */}
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
          >
            {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
            <span className="group-hover:translate-y-0.5 transition-transform">
              {showLeaderboard ? "↑" : "↓"}
            </span>
          </button>
          
          {showLeaderboard && (
            <div className="w-full animate-accordion-down">
              <Leaderboard entries={leaderboard} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
