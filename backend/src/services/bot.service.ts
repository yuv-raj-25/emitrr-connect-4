import type { Cell, Player } from "../types/game.types.js";
import { checkWin } from "../utility/gameEngine.js";

const ROWS = 6;
const COLS = 7;

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

    // 3️⃣ Prefer center column
    const center = Math.floor(COLS / 2);
    if (this.isColumnAvailable(board, center)) {
      return center;
    }

    // 4️⃣ Pick first available column
    for (let col = 0; col < COLS; col++) {
      if (this.isColumnAvailable(board, col)) {
        return col;
      }
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
}

export const botService = new BotService();
