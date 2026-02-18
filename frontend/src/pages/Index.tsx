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
    winner, connectionError
  } = useGameSocket();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Connection Error Screen
  if (connectionError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="text-6xl">🔌</div>
        <h1 className="text-3xl font-bold text-red-400">Server Offline</h1>
        <p className="text-slate-400 max-w-sm">
          Unable to connect to the game server. Please check your internet connection or try again later.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors border border-slate-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const isInGame = status === "playing";
  const isGameOver = status === "won" || status === "draw" || status === "forfeited";
  const isWaiting = status === "waiting" && message.includes("Waiting");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-x-hidden">
      <div className="w-full max-w-4xl flex flex-col gap-6 sm:gap-8 items-center">
        
        {/* Header - scaled down on mobile */}
        <div className="text-center space-y-2 pt-4 sm:pt-0">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 drop-shadow-sm">
            4 In A Row
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg">Online Multiplayer Strategy Game</p>
        </div>

        {/* Lobby / Username Entry */}
        {!isInGame && !isGameOver && (
          <div className="w-full max-w-md px-2">
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
          <div className="flex flex-col items-center gap-4 sm:gap-6 animate-accordion-down w-full">
            <div className="flex items-center gap-3 text-xs sm:text-sm px-4 py-2 rounded-full glass">
              <span className="text-muted-foreground">vs</span>
              <strong className="text-base sm:text-lg text-foreground truncate max-w-[150px]">{opponentName}</strong>
              {gameId && <span className="text-[10px] text-muted-foreground opacity-50 ml-1">#{gameId.slice(0, 4)}</span>}
            </div>
            
            <div className="w-full flex justify-center overflow-x-auto pb-4 px-2">
              <GameBoard
                board={board}
                currentPlayer={currentPlayer}
                playerNumber={playerNumber}
                onDropDisc={dropDisc}
                disabled={isGameOver}
                winningCells={winningCells}
              />
            </div>
          </div>
        )}

        {/* Game Over Actions */}
        {isGameOver && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 animate-bounce-in px-4 text-center">
            {status === "won" && winner && (
              <div>
                <p className="text-3xl sm:text-4xl font-bold drop-shadow-md" style={{ color: message.includes("You win") ? "#4ade80" : "#f87171" }}>
                  {message.includes("You win") ? "🎉 Victory! 🎉" : "💔 Defeat"}
                </p>
              </div>
            )}
            {status === "draw" && (
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-yellow-400 drop-shadow-md">🤝 It's a Draw!</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={playAgain}
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold text-lg w-full sm:w-auto"
              >
                Play Again
              </button>
              <button
                onClick={disconnect}
                className="px-8 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors font-medium w-full sm:w-auto"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard Toggle */}
        <div className="w-full max-w-md flex flex-col items-center gap-4 px-4 pb-8">
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group py-2"
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
