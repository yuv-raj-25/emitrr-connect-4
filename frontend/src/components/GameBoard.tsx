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

const DISC_COLORS: Record<number, string> = {
  0: "#e2e8f0",   // empty — light gray
  1: "#ef4444",   // player 1 — red
  2: "#facc15",   // player 2 — yellow
};

function isWinningCell(row: number, col: number, winningCells: [number, number][] | null): boolean {
  if (!winningCells) return false;
  return winningCells.some(([r, c]) => r === row && c === col);
}

export const GameBoard = memo(function GameBoard({ board, currentPlayer, playerNumber, onDropDisc, disabled, winningCells }: GameBoardProps) {
  const isMyTurn = playerNumber === currentPlayer;
  const canClick = !disabled && isMyTurn;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <p style={{ fontSize: "14px", color: "#64748b" }}>
        {disabled
          ? "Game over"
          : isMyTurn
          ? "🟢 Your turn — click a column to drop your disc"
          : "⏳ Opponent's turn"}
      </p>

      {/* Game Grid */}
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: "4px",
          padding: "12px",
          backgroundColor: "#1e3a5f",
          borderRadius: "12px",
          position: "relative",
        }}
      >
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const cellValue = board[row]?.[col] ?? 0;
            const isWinner = isWinningCell(row, col, winningCells);
            return (
              <button
                key={`${row}-${col}`}
                onClick={() => onDropDisc(col)}
                disabled={!canClick}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: DISC_COLORS[cellValue] || DISC_COLORS[0],
                  border: isWinner ? "3px solid #ffffff" : "2px solid #15274080",
                  cursor: canClick ? "pointer" : "default",
                  opacity: canClick && cellValue === 0 ? 1 : undefined,
                  transition: "background-color 0.2s, transform 0.1s, box-shadow 0.3s",
                  padding: 0,
                  boxShadow: isWinner
                    ? `0 0 12px 4px ${cellValue === 1 ? "#ef444480" : "#facc1580"}, 0 0 24px 8px ${cellValue === 1 ? "#ef444440" : "#facc1540"}`
                    : "none",
                  animation: isWinner ? "winPulse 1s ease-in-out infinite" : "none",
                  transform: isWinner ? "scale(1.1)" : "scale(1)",
                  zIndex: isWinner ? 2 : 1,
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (canClick && cellValue === 0) {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.backgroundColor = playerNumber === 1 ? "#fca5a5" : "#fde68a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (cellValue === 0) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = DISC_COLORS[0];
                  }
                }}
                aria-label={`Row ${row + 1}, Column ${col + 1}${cellValue === 0 ? " (empty)" : ""}${isWinner ? " (winning)" : ""}`}
              />
            );
          })
        )}
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
