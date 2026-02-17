import { gameService } from "./game.service.js";

type MatchResult =
  | { status: "WAITING" }
  | { status: "MATCHED"; gameId: string; opponent: string }
  | { status: "BOT_MATCHED"; gameId: string };

class MatchmakingService {
  private waitingPlayer: string | null = null;
  private waitingTimer: NodeJS.Timeout | null = null;

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
        this.startBotGame(username);
      }
    }, 10000);

    return { status: "WAITING" };
  }

  private startBotGame(username: string) {
    if (this.waitingPlayer !== username) return;

    this.waitingPlayer = null;

    const game = gameService.createGame(username, "BOT");

    console.log(`Bot game started for ${username}`, game.id);
  }
}

export const matchmakingService = new MatchmakingService();
