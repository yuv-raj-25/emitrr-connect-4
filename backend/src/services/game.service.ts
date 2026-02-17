import { v4 as uuidv4 } from "uuid";
import {
  createBoard,
  dropDisc,
  switchPlayer,
  checkWin,
  checkDraw,
} from "../utility/gameEngine.js";
import type { ActiveGame, GameBoard, Player } from "../types/game.types.js";

import { leaderboardService } from "./leaderboard.service.js";
import { getDB } from "../db/index.js";


const activeGames = new Map<string, ActiveGame>();
const playerGameMap = new Map<string, string>();

class GameService {
  private gameBoardMap = new Map<string, GameBoard>();

  createGame(player1: string, player2: string): ActiveGame {
    
    const gameBoard = createBoard();

    const game: ActiveGame = {
      id: uuidv4(),
      board: gameBoard.board,
      currentPlayer: gameBoard.currentPlayer,
      player1,
      player2,
      status: "ONGOING",
      createdAt: Date.now(),
      disconnectedPlayers: new Set(),
      disconnectTimers: new Map(),
    };

    this.gameBoardMap.set(game.id, gameBoard);

    activeGames.set(game.id, game);
    playerGameMap.set(player1, game.id);
    playerGameMap.set(player2, game.id);

    return game;
  }

  getGameByPlayer(username: string): ActiveGame | undefined {
    const gameId = playerGameMap.get(username);
    if (!gameId) return undefined;

    return activeGames.get(gameId);
  }

  async makeMove(username: string, column: number) {
    const game = this.getGameByPlayer(username);
    if (!game || game.status !== "ONGOING") {
      return { error: "Game not found or finished" };
    }

    const playerNumber: Player =
      username === game.player1 ? 1 : 2;

    if (game.currentPlayer !== playerNumber) {
      return { error: "Not your turn" };
    }

    const gameBoard = this.gameBoardMap.get(game.id);
    if (!gameBoard) return { error: "Game board not found" };

    const result = dropDisc(gameBoard, column);

    if (!result.success) {
      return { error: "Invalid move" };
    }

    const { row, col } = result;

    // Check win
    const hasWon = checkWin(game.board, row!, col!, playerNumber);
    if (hasWon) {
      game.status = "FINISHED";
      game.winner = username;

      const duration = Math.floor((Date.now() - game.createdAt) / 1000);

      try {
        await leaderboardService.finishGame(
          game.id, game.player1, game.player2, username, duration
        );
      } catch (err) {
        console.error("Failed to persist game result:", err);
      }

      this.cleanupGame(game.id);

      return {
        game,
        winner: username,
      };
    }

    // Check draw
    const isDraw = checkDraw(gameBoard);
    if (isDraw) {
      game.status = "FINISHED";

      const duration = Math.floor((Date.now() - game.createdAt) / 1000);

      try {
        await leaderboardService.finishGame(
          game.id, game.player1, game.player2, null, duration
        );
      } catch (err) {
        console.error("Failed to persist draw result:", err);
      }

      this.cleanupGame(game.id);

      return {
        game,
        draw: true,
      };
    }

    // Switch turn
    // Sync board state back to ActiveGame
    game.board = gameBoard.board;
    game.currentPlayer = gameBoard.currentPlayer;

    switchPlayer(gameBoard);
    game.currentPlayer = gameBoard.currentPlayer;

    return { game };
  }

  cleanupGame(gameId: string) {
    const game = activeGames.get(gameId);
    if (!game) return;

    playerGameMap.delete(game.player1);
    playerGameMap.delete(game.player2);
    activeGames.delete(gameId);
    this.gameBoardMap.delete(gameId);
  }

handleDisconnect(username: string) {
  const game = this.getGameByPlayer(username);
  if (!game || game.status !== "ONGOING") return;

  console.log(`${username} disconnected from game ${game.id}`);

  game.disconnectedPlayers?.add(username);

  const timer = setTimeout(() => {
    console.log(`${username} did not reconnect. Forfeiting.`);

    game.status = "FINISHED";
    game.winner =
      username === game.player1 ? game.player2 : game.player1;

    this.cleanupGame(game.id);
  }, 30000);

  game.disconnectTimers?.set(username, timer);
    }
handleReconnect(username: string) {
  const game = this.getGameByPlayer(username);
  if (!game || game.status !== "ONGOING") return null;

  if (game.disconnectedPlayers?.has(username)) {
    console.log(`${username} reconnected`);

    const timer = game.disconnectTimers?.get(username);
    if (timer) clearTimeout(timer);

    game.disconnectedPlayers?.delete(username);
    game.disconnectTimers?.delete(username);

    return game;
  }

  return null;
    }
}

export const gameService = new GameService();
