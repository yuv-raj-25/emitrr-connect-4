import { getDB } from "../db/index.js";

class LeaderboardService {

  /**
   * Atomically records game result + updates leaderboard in a single transaction.
   * If any step fails, the entire operation is rolled back.
   */
  async finishGame(
    gameId: string,
    player1: string,
    player2: string,
    winner: string | null,
    duration: number
  ) {
    const db = getDB();
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // 1. Record the game
      await client.query(
        `INSERT INTO games (id, player1, player2, winner, duration)
         VALUES ($1, $2, $3, $4, $5)`,
        [gameId, player1, player2, winner, duration]
      );

      // 2. Update leaderboard
      if (winner) {
        // Winner: increment wins
        await client.query(
          `INSERT INTO leaderboard (username, wins, losses, draws, last_updated)
           VALUES ($1, 1, 0, 0, CURRENT_TIMESTAMP)
           ON CONFLICT (username)
           DO UPDATE SET
             wins = leaderboard.wins + 1,
             last_updated = CURRENT_TIMESTAMP`,
          [winner]
        );

        // Loser: increment losses
        const loser = winner === player1 ? player2 : player1;
        await client.query(
          `INSERT INTO leaderboard (username, wins, losses, draws, last_updated)
           VALUES ($1, 0, 1, 0, CURRENT_TIMESTAMP)
           ON CONFLICT (username)
           DO UPDATE SET
             losses = leaderboard.losses + 1,
             last_updated = CURRENT_TIMESTAMP`,
          [loser]
        );
      } else {
        // Draw: increment draws for both players
        for (const player of [player1, player2]) {
          await client.query(
            `INSERT INTO leaderboard (username, wins, losses, draws, last_updated)
             VALUES ($1, 0, 0, 1, CURRENT_TIMESTAMP)
             ON CONFLICT (username)
             DO UPDATE SET
               draws = leaderboard.draws + 1,
               last_updated = CURRENT_TIMESTAMP`,
            [player]
          );
        }
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async recordGame(
    gameId: string,
    player1: string,
    player2: string,
    winner: string | null,
    duration: number
  ) {
    const db = getDB();
    const query = `
      INSERT INTO games (id, player1, player2, winner, duration)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await db.query(query, [gameId, player1, player2, winner, duration]);
  }

  async updateWin(username: string) {
    const db = getDB();
    const query = `
      INSERT INTO leaderboard (username, wins, last_updated)
      VALUES ($1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (username)
      DO UPDATE SET 
        wins = leaderboard.wins + 1,
        last_updated = CURRENT_TIMESTAMP
    `;
    await db.query(query, [username]);
  }

  async getLeaderboard(limit = 10) {
    const db = getDB();
    const query = `
      SELECT username, wins, losses, draws, last_updated
      FROM leaderboard
      ORDER BY wins DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  async getGameHistory(username: string, limit = 10) {
    const db = getDB();
    const query = `
      SELECT * FROM games
      WHERE player1 = $1 OR player2 = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await db.query(query, [username, limit]);
    return result.rows;
  }
}

export const leaderboardService = new LeaderboardService();
