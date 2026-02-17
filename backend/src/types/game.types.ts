export type Player = 1 | 2;
export type Cell = 0 | Player;
export type GameStatus = "playing" | "won" | "draw";

export interface MoveResult {
  success: boolean;
  row?: number;
  col?: number;
}

export interface GameBoard {
  board: Cell[][];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  moveCount: number;
}

export interface ActiveGame {
  id: string;
  board: Cell[][];
  currentPlayer: Player;
  player1: string;
  player2: string;
  status: "ONGOING" | "FINISHED";
  createdAt: number;
  winner?: string;

  disconnectedPlayers?: Set<string>;
  disconnectTimers?: Map<string, NodeJS.Timeout>;
}
