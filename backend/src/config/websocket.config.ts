import { WebSocketServer, WebSocket } from "ws";
import { matchmakingService } from "../services/matchmaking.service.js";
import { gameService } from "../services/game.service.js";
import { botService } from "../services/bot.service.js";

interface Client extends WebSocket {
  username?: string;
}

const clients = new Map<string, Client>();

export function setupWebSocket(wss: WebSocketServer) {
  // When matchmaking auto-creates a bot game, notify the client
  matchmakingService.setOnBotGameStart((username, game) => {
    const socket = clients.get(username);
    socket?.send(
      JSON.stringify({
        type: "GAME_START",
        game,
        player: username,
      })
    );
  });

  wss.on("connection", (socket: Client) => {
    console.log("Client connected");

    socket.on("message", (raw: string) => {
      const data = JSON.parse(raw);

      switch (data.type) {
        case "JOIN_GAME":
          handleJoin(socket, data.username);
          break;

        case "JOIN_BOT_GAME":
          handleJoinBot(socket, data.username);
          break;

        case "MAKE_MOVE":
          handleMove(socket, data.column);
          break;

        case "LEAVE_GAME":
          handleLeaveGame(socket);
          break;
      }
    });

    socket.on("close", () => {
        if (socket.username) {
            clients.delete(socket.username);
            const game = gameService.handleDisconnect(socket.username);
            
            if (game) {
              const opponentUsername = game.player1 === socket.username ? game.player2 : game.player1;
              const opponentSocket = clients.get(opponentUsername);
              opponentSocket?.send(JSON.stringify({ type: "OPPONENT_DISCONNECTED" }));
            }
            
            console.log(`${socket.username} disconnected`);
        }
    });
  });
}

/* ---------------- JOIN ---------------- */

function handleJoin(socket: Client, username: string) {
  socket.username = username;
  clients.set(username, socket);

  const result = matchmakingService.joinQueue(username);
  const existingGame = gameService.handleReconnect(username);

  // If player reconnected
  if (existingGame) {
    socket.send(
      JSON.stringify({
        type: "GAME_RECONNECTED",
        game: existingGame,
      })
    );

    // Notify opponent
    const opponent = existingGame.player1 === username ? existingGame.player2 : existingGame.player1;
    const opponentSocket = clients.get(opponent);
    opponentSocket?.send(JSON.stringify({ type: "OPPONENT_RECONNECTED" }));

    return;
  }

  if (result.status === "WAITING") {
    socket.send(JSON.stringify({ type: "WAITING" }));
  }

  if (result.status === "MATCHED") {
    const game = gameService.getGameByPlayer(username);

    const opponentSocket = clients.get(result.opponent);

    socket.send(
      JSON.stringify({
        type: "GAME_START",
        game,
        player: username,
      })
    );

    opponentSocket?.send(
      JSON.stringify({
        type: "GAME_START",
        game,
        player: result.opponent,
      })
    );
  }
}

function handleJoinBot(socket: Client, username: string) {
  socket.username = username;
  clients.set(username, socket);

  // Directly create bot game
  matchmakingService.createBotGame(username);
}

/* ---------------- LEAVE GAME ---------------- */

async function handleLeaveGame(socket: Client) {
  if (!socket.username) return;

  // Remove from matchmaking queue if waiting
  matchmakingService.leaveQueue(socket.username);

  // Forfeit if in active game
  const result = await gameService.forfeitGame(socket.username);
  
  if (result) {
    broadcastGameOver(result.game, result.winner, false, undefined);
  }

  console.log(`${socket.username} left game`);
}

/* ---------------- MOVE ---------------- */

async function handleMove(socket: Client, column: number) {
  if (!socket.username) return;

  const result = await gameService.makeMove(socket.username, column);

  if ("error" in result) {
    socket.send(JSON.stringify({ type: "ERROR", message: result.error }));
    return;
  }

  const game = result.game;

  broadcastGameState(game);

  // If finished
  if (result.winner || result.draw) {
    broadcastGameOver(game, result.winner, result.draw, result.winningCells);
    return;
  }

  // If opponent is bot → trigger bot move
  if (game.player2 === "BOT" && game.currentPlayer === 2) {
    const botMove = botService.getBestMove(game.board);

    const botResult = await gameService.makeMove("BOT", botMove);

    if (!("error" in botResult)) {
      broadcastGameState(botResult.game);

      if (botResult.winner || botResult.draw) {
        broadcastGameOver(
          botResult.game,
          botResult.winner,
          botResult.draw,
          botResult.winningCells
        );
      }
    }
  }
}

/* ---------------- HELPERS ---------------- */

function broadcastGameState(game: any) {
  const p1 = clients.get(game.player1);
  const p2 = clients.get(game.player2);

  const payload = JSON.stringify({
    type: "GAME_UPDATE",
    game,
  });

  p1?.send(payload);
  p2?.send(payload);
}

function broadcastGameOver(game: any, winner?: string, draw?: boolean, winningCells?: [number, number][]) {
  const p1 = clients.get(game.player1);
  const p2 = clients.get(game.player2);

  const payload = JSON.stringify({
    type: "GAME_OVER",
    winner: winner || null,
    draw: draw || false,
    winningCells: winningCells || null,
    game,
  });

  p1?.send(payload);
  p2?.send(payload);
}
