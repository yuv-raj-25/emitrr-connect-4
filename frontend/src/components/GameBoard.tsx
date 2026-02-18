import { memo } from "react";
import { type Board, ROWS, COLS, type Player } from "@/types/game";

interface GameBoardProps {
  board: Board;
  currentPlayer: Player;
  playerNumber: Player | null;
  onDropDisc: (col: number) => void;
  disabled: boolean;
  winningCells: [number, number][] | null;
}

function isWinningCell(row: number, col: number, winningCells: [number, number][] | null): boolean {
  if (!winningCells) return false;
  return winningCells.some(([r, c]) => r === row && c === col);
}

export const GameBoard = memo(function GameBoard({ board, currentPlayer, playerNumber, onDropDisc, disabled, winningCells }: GameBoardProps) {
  const isMyTurn = playerNumber === currentPlayer;
  const canClick = !disabled && isMyTurn;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <p className="text-sm font-medium text-slate-400 mb-2">
        {disabled
          ? "Game Over"
          : isMyTurn
          ? "✨ It's your turn! Select a column."
          : `⏳ Waiting for ${playerNumber === 1 ? "Player 2" : "Player 1"}...`}
      </p>

      {/* Game Grid */}
      <div
        className="relative p-3 bg-blue-900 rounded-xl shadow-2xl border-4 border-blue-950"
        style={{
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.6), 0 10px 25px -5px rgba(0, 0, 0, 0.5)",
          background: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)"
        }}
      >
        <div
          style={{
            display: "inline-grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: "8px",
            padding: "8px",
          }}
        >
          {Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const cellValue = board[row]?.[col] ?? 0;
              const isWinner = isWinningCell(row, col, winningCells);
              
              // Disc Colors
              const p1Gradient = "radial-gradient(circle at 30% 30%, #fca5a5, #ef4444, #991b1b)";
              const p2Gradient = "radial-gradient(circle at 30% 30%, #fde047, #eab308, #854d0e)";
              const emptyColor = "#0f172a"; // slate-900
              
              let background = emptyColor;
              if (cellValue === 1) background = p1Gradient;
              if (cellValue === 2) background = p2Gradient;

              return (
                <button
                  key={`${row}-${col}`}
                  onClick={() => onDropDisc(col)}
                  disabled={!canClick}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: background,
                    boxShadow: cellValue !== 0 
                      ? "2px 5px 10px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(0,0,0,0.2)" 
                      : "inset 2px 5px 6px rgba(0,0,0,0.5)", // Inner shadow for empty holes
                    border: isWinner ? "4px solid white" : "none",
                    cursor: canClick ? "pointer" : "default",
                    transform: isWinner ? "scale(1.1)" : "scale(1)",
                    opacity: canClick && cellValue === 0 ? 0.9 : 1,
                    transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    position: "relative",
                    zIndex: isWinner ? 10 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (canClick && cellValue === 0) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (cellValue === 0) {
                      e.currentTarget.style.background = emptyColor;
                      e.currentTarget.style.boxShadow = "inset 2px 5px 6px rgba(0,0,0,0.5)";
                    }
                  }}
                  aria-label={`Row ${row + 1}, Column ${col + 1}${cellValue === 0 ? " (empty)" : ""}${isWinner ? " (winning)" : ""}`}
                >
                  {isWinner && (
                    <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ "--glow-color": cellValue === 1 ? "rgba(239, 68, 68, 0.6)" : "rgba(234, 179, 8, 0.6)" } as React.CSSProperties} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" }} />
          Player 1 {playerNumber === 1 ? "(You)" : ""}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#facc15", display: "inline-block" }} />
          Player 2 {playerNumber === 2 ? "(You)" : ""}
        </span>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes winPulse {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.2); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
});
