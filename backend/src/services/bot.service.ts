import type { Cell, Player } from "../types/game.types.js";
import { checkWin } from "../utility/gameEngine.js";

const ROWS = 6;
const COLS = 7;
const EMPTY: Cell = 0;
const PLAYER_HUMAN: Player = 1;
const PLAYER_BOT: Player = 2;

const WINDOW_LENGTH = 4;

class BotService {
  getBestMove(board: Cell[][]): number {
    const bot: Player = 2;
    const human: Player = 1;

    // 1️⃣ Check if bot can win
    for (let col = 0; col < COLS; col++) {
      const tempBoard = this.cloneBoard(board);
      const row = this.simulateDrop(tempBoard, col, bot);

      if (row !== -1 && checkWin(tempBoard, row, col, bot)) {
        return col;
      }
    }

    // 2️⃣ Block human win
    for (let col = 0; col < COLS; col++) {
      const tempBoard = this.cloneBoard(board);
      const row = this.simulateDrop(tempBoard, col, human);

      if (row !== -1 && checkWin(tempBoard, row, col, human)) {
        return col;
      }
    }

    // 3️⃣ Score available moves
    let bestScore = -Infinity;
    let bestColumn = -1;
    // Iterate columns to find best score
    // Start from center outward for tie-breaking
    const center = Math.floor(COLS / 2);
    const columns = [center];
    for (let c = 1; c <= center; c++) {
      if (center - c >= 0) columns.push(center - c);
      if (center + c < COLS) columns.push(center + c);
    }

    for (const col of columns) {
      if (!this.isColumnAvailable(board, col)) continue;

      const tempBoard = this.cloneBoard(board);
      this.simulateDrop(tempBoard, col, bot);
      const score = this.scorePosition(tempBoard, bot);

      if (score > bestScore) {
        bestScore = score;
        bestColumn = col;
      }
    }

    if (bestColumn !== -1) return bestColumn;

    // Fallback (should be covered by above)
    for (let col = 0; col < COLS; col++) {
      if (this.isColumnAvailable(board, col)) return col;
    }

    return -1; // board full
  }

  private cloneBoard(board: Cell[][]): Cell[][] {
    return board.map(row => [...row]);
  }

  private simulateDrop(
    board: Cell[][],
    column: number,
    player: Player
  ): number {
    if (column < 0 || column >= COLS) return -1;

    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row]![column] === 0) {
        board[row]![column] = player;
        return row;
      }
    }

    return -1;
  }

  private isColumnAvailable(board: Cell[][], column: number): boolean {
    return board[0]![column] === 0;
  }

  /* ---------------- SCORING HEURISTIC ---------------- */

  private scorePosition(board: Cell[][], piece: Player): number {
    let score = 0;

    // Center Column Preference
    const centerArray: Cell[] = [];
    for (let r = 0; r < ROWS; r++) {
      centerArray.push(board[r]![Math.floor(COLS / 2)]!);
    }
    const centerCount = centerArray.filter((c) => c === piece).length;
    score += centerCount * 3;

    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      const rowArray = board[r]!;
      for (let c = 0; c < COLS - 3; c++) {
        const window = rowArray.slice(c, c + WINDOW_LENGTH);
        score += this.evaluateWindow(window, piece);
      }
    }

    // Vertical
    for (let c = 0; c < COLS; c++) {
      const colArray: Cell[] = [];
      for (let r = 0; r < ROWS; r++) {
        colArray.push(board[r]![c]!);
      }
      for (let r = 0; r < ROWS - 3; r++) {
        const window = colArray.slice(r, r + WINDOW_LENGTH);
        score += this.evaluateWindow(window, piece);
      }
    }

    // Diagonal Positive
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window: Cell[] = [];
        for (let i = 0; i < WINDOW_LENGTH; i++) {
          window.push(board[r + i]![c + i]!);
        }
        score += this.evaluateWindow(window, piece);
      }
    }

    // Diagonal Negative
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window: Cell[] = [];
        for (let i = 0; i < WINDOW_LENGTH; i++) {
          window.push(board[r + 3 - i]![c + i]!);
        }
        score += this.evaluateWindow(window, piece);
      }
    }

    return score;
  }

  private evaluateWindow(window: Cell[], piece: Player): number {
    let score = 0;
    const oppPiece: Player = piece === PLAYER_HUMAN ? PLAYER_BOT : PLAYER_HUMAN;

    const pieceCount = window.filter((c) => c === piece).length;
    const emptyCount = window.filter((c) => c === EMPTY).length;
    const oppCount = window.filter((c) => c === oppPiece).length;

    if (pieceCount === 4) {
      score += 100;
    } else if (pieceCount === 3 && emptyCount === 1) {
      score += 5;
    } else if (pieceCount === 2 && emptyCount === 2) {
      score += 2;
    }

    // Block opponent (defensive)
    if (oppCount === 3 && emptyCount === 1) {
      score -= 4; // Penalize board state where opponent has 3
      // Wait, scorePosition is for ME (Bot).
      // If the resulting board has a window with 3 opponent pieces and 1 empty,
      // that means the opponent MIGHT win next turn?
      // No, this evaluates the board *after* I moved.
      // So if I moved, and the board STILL has 3 opp pieces + 1 empty,
      // it means I didn't block it (unless there are multiple).
      
      // Actually, standard Minimax evaluates the leaf node.
      // Here we simulate MY move.
      // If the board has high positive score, it's good for ME.
      // If the board has high negative score, it's bad for ME.
      
      // If opponent has 3 in a row, it's BAD for me.
      score -= 80; 
    }

    return score;
  }
}

export const botService = new BotService();
