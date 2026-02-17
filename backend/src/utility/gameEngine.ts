import type { Cell, GameBoard, GameStatus, MoveResult, Player } from "../types/game.types.js";

export const ROWS = 6;
export const COLS = 7;

// ──────────────────────────────────────────────
//  Board creation
// ──────────────────────────────────────────────

export function createBoard(): GameBoard {
  const board: Cell[][] = Array.from({ length: ROWS }, () =>
    Array<Cell>(COLS).fill(0)
  );

  return {
    board,
    currentPlayer: 1,
    status: "playing",
    winner: null,
    moveCount: 0,
  };
}

// ──────────────────────────────────────────────
//  Move validation
// ──────────────────────────────────────────────

/** Check whether a column can accept another disc. */
export function isValidMove(game: GameBoard, column: number): boolean {
  if (column < 0 || column >= COLS) return false;
  // Top cell of that column must be empty
  const topRow = game.board[0];
  return topRow !== undefined && topRow[column] === 0;
}

/** Return every column index that still has room. */
export function getValidColumns(game: GameBoard): number[] {
  const cols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (isValidMove(game, c)) cols.push(c);
  }
  return cols;
}

// ──────────────────────────────────────────────
//  Disc drop (low-level, does NOT switch player)
// ──────────────────────────────────────────────

export function dropDisc(game: GameBoard, column: number): MoveResult {
  if (column < 0 || column >= COLS) {
    return { success: false };
  }

  for (let row = ROWS - 1; row >= 0; row--) {
    const rowArray = game.board[row];
    if (rowArray && rowArray[column] === 0) {
      rowArray[column] = game.currentPlayer;
      game.moveCount++;
      return { success: true, row, col: column };
    }
  }

  return { success: false }; // column full
}

// ──────────────────────────────────────────────
//  Turn switch
// ──────────────────────────────────────────────

export function switchPlayer(game: GameBoard): void {
  game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
}

// ──────────────────────────────────────────────
//  Win detection
// ──────────────────────────────────────────────

export function checkWin(
  board: Cell[][],
  row: number,
  col: number,
  player: Player
): boolean {
  return (
    checkDirection(board, row, col, player, 0, 1) || // horizontal
    checkDirection(board, row, col, player, 1, 0) || // vertical
    checkDirection(board, row, col, player, 1, 1) || // diagonal ↘
    checkDirection(board, row, col, player, 1, -1)   // diagonal ↙
  );
}

function checkDirection(
  board: Cell[][],
  row: number,
  col: number,
  player: Player,
  rowDir: number,
  colDir: number
): boolean {
  let count = 1;
  count += countInDirection(board, row, col, player, rowDir, colDir);
  count += countInDirection(board, row, col, player, -rowDir, -colDir);
  return count >= 4;
}

function countInDirection(
  board: Cell[][],
  row: number,
  col: number,
  player: Player,
  rowDir: number,
  colDir: number
): number {
  let r = row + rowDir;
  let c = col + colDir;
  let count = 0;

  while (
    r >= 0 &&
    r < ROWS &&
    c >= 0 &&
    c < COLS &&
    board[r]?.[c] === player
  ) {
    count++;
    r += rowDir;
    c += colDir;
  }

  return count;
}

// ──────────────────────────────────────────────
//  Draw detection (O(1) via moveCount)
// ──────────────────────────────────────────────

export function checkDraw(game: GameBoard): boolean {
  return game.moveCount === ROWS * COLS;
}

// ──────────────────────────────────────────────
//  makeMove — single entry-point for a full turn
// ──────────────────────────────────────────────

export interface MakeMoveResult {
  success: boolean;
  row?: number;
  col?: number;
  status: GameStatus;
  winner: Player | null;
}

export function makeMove(game: GameBoard, column: number): MakeMoveResult {
  // Reject if game is already over
  if (game.status !== "playing") {
    return { success: false, status: game.status, winner: game.winner };
  }

  // Reject invalid move
  if (!isValidMove(game, column)) {
    return { success: false, status: game.status, winner: game.winner };
  }

  const result = dropDisc(game, column);
  if (!result.success || result.row === undefined || result.col === undefined) {
    return { success: false, status: game.status, winner: game.winner };
  }

  const player = game.currentPlayer;

  // Check win
  if (checkWin(game.board, result.row, result.col, player)) {
    game.status = "won";
    game.winner = player;
    return {
      success: true,
      row: result.row,
      col: result.col,
      status: "won",
      winner: player,
    };
  }

  // Check draw
  if (checkDraw(game)) {
    game.status = "draw";
    return {
      success: true,
      row: result.row,
      col: result.col,
      status: "draw",
      winner: null,
    };
  }

  // Continue — switch turn
  switchPlayer(game);
  return {
    success: true,
    row: result.row,
    col: result.col,
    status: "playing",
    winner: null,
  };
}
