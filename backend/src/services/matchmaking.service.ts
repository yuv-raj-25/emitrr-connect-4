import { gameService } from "./game.service.js";
import { v4 as uuidv4 } from "uuid";

type MatchResult =
  | { status: "WAITING" }
  | { status: "MATCHED"; gameId: string; opponent: string }
  | { status: "BOT_MATCHED"; gameId: string };

type BotGameCallback = (username: string, game: any) => void;

class MatchmakingService {
  private waitingPlayer: string | null = null;
  private waitingTimer: NodeJS.Timeout | null = null;
  private onBotGameStart: BotGameCallback | null = null;

  /** Register a callback that fires when a bot game is auto-created */
  setOnBotGameStart(cb: BotGameCallback) {
    this.onBotGameStart = cb;
  }

  joinQueue(username: string): MatchResult {
    // If someone already waiting → match immediately
    if (this.waitingPlayer && this.waitingPlayer !== username) {
      const opponent = this.waitingPlayer;

      if (this.waitingTimer) {
        clearTimeout(this.waitingTimer);
        this.waitingTimer = null;
      }

      this.waitingPlayer = null;

      const game = gameService.createGame(opponent, username);

      return {
        status: "MATCHED",
        gameId: game.id,
        opponent,
      };
    }

    // Otherwise add to queue
    this.waitingPlayer = username;

    this.waitingTimer = setTimeout(() => {
      if (this.waitingPlayer === username) {
        this.createBotGame(username);
      }
    }, 10000);

    return { status: "WAITING" };
  }

  leaveQueue(username: string) {
    if (this.waitingPlayer === username) {
      if (this.waitingTimer) {
        clearTimeout(this.waitingTimer);
        this.waitingTimer = null;
      }
      this.waitingPlayer = null;
    }
  }

  public createBotGame(username: string): MatchResult {
    if (this.onBotGameStart) {
      const gameId = uuidv4();
      const game = gameService.createGame(username, "BOT");
      // @ts-ignore - Manually override ID if needed, or rely on createGame generating one. 
      // Actually createGame generates ID. We should return that ID.
      this.onBotGameStart(username, game);
      return { status: "BOT_MATCHED", gameId: game.id };
    }
    return { status: "WAITING" }; // Should ideally be an error or different status if callback not set
  }
}

export const matchmakingService = new MatchmakingService();
