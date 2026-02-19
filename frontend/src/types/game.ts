export type Player = 1 | 2;
export type Cell = 0 | Player;
export type Board = Cell[][];

export const ROWS = 6;
export const COLS = 7;

export type GameStatus = "waiting" | "playing" | "won" | "lost" | "draw" | "forfeited";

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  playerNumber: Player | null;
  opponentName: string;
  gameId: string;
}

export interface LeaderboardEntry {
  username: string;
  wins: number;
  losses: number;
  draws: number;
}

export function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}
