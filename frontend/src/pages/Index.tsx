import { useState } from "react";
import { useGameSocket } from "@/hooks/useGameSocket";
import { Lobby } from "@/components/Lobby";
import { GameBoard } from "@/components/GameBoard";
import { Leaderboard } from "@/components/Leaderboard";

const Index = () => {
  const {
    board, currentPlayer, playerNumber, status,
    opponentName, gameId, leaderboard, message,
    countdown, winningCells, connect, dropDisc, playAgain, disconnect,
    winner,
  } = useGameSocket();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const isInGame = status === "playing";
  const isGameOver = status === "won" || status === "draw" || status === "forfeited";
  const isWaiting = status === "waiting" && message.includes("Waiting");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      {/* Lobby / Username Entry */}
      {!isInGame && !isGameOver && (
        <Lobby onJoin={connect} onDisconnect={disconnect} message={message} isWaiting={isWaiting} countdown={countdown} />
      )}

      {/* Game Board */}
      {(isInGame || isGameOver) && (
        <>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>vs <strong className="text-foreground">{opponentName}</strong></span>
            {gameId && <span className="text-xs">Game: {gameId}</span>}
          </div>
          <GameBoard
            board={board}
            currentPlayer={currentPlayer}
            playerNumber={playerNumber}
            onDropDisc={dropDisc}
            disabled={isGameOver}
            winningCells={winningCells}
          />
        </>
      )}

      {/* Game Over */}
      {isGameOver && (
        <div className="flex flex-col items-center gap-3">
          {status === "won" && winner && (
            <div
              className="text-center"
              style={{ animation: "bounceIn 0.6s ease-out" }}
            >
              <p className="text-3xl font-bold" style={{ color: message.includes("You win") ? "#22c55e" : "#ef4444" }}>
                {message.includes("You win") ? "🎉 You Win! 🎉" : "😞 You Lose!"}
              </p>
            </div>
          )}
          {status === "draw" && (
            <div className="text-center" style={{ animation: "bounceIn 0.6s ease-out" }}>
              <p className="text-3xl font-bold text-yellow-400">🤝 It's a Draw!</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={playAgain}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Play Again
            </button>
            <button
              onClick={disconnect}
              className="border border-border text-muted-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Toggle */}
      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        className="text-sm text-muted-foreground underline hover:text-foreground"
      >
        {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
      </button>
      {showLeaderboard && <Leaderboard entries={leaderboard} />}
    </div>
  );
};

export default Index;
