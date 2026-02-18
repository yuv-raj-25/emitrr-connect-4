import { useCallback, useEffect, useRef, useState } from "react";
import { WS_URL, API_URL } from "@/config";
import type { Board, GameStatus, Player, LeaderboardEntry } from "@/types/game";
import { createEmptyBoard } from "@/types/game";

interface UseGameSocketReturn {
  board: Board;
  currentPlayer: Player;
  playerNumber: Player | null;
  status: GameStatus;
  winner: string | null;
  opponentName: string;
  gameId: string;
  leaderboard: LeaderboardEntry[];
  message: string;
  connectionError: boolean;
  countdown: number | null;
  turnDeadline: number | null;
  winningCells: [number, number][] | null;
  connect: (username: string) => void;
  playBot: (username: string) => void;
  dropDisc: (col: number) => void;
  playAgain: () => void;
  disconnect: () => void;
}

export function useGameSocket(): UseGameSocketReturn {
  const ws = useRef<WebSocket | null>(null);
  const usernameRef = useRef<string>("");
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [playerNumber, setPlayerNumber] = useState<Player | null>(null);
  const [status, setStatus] = useState<GameStatus>("waiting");
  const [winner, setWinner] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState("");
  const [gameId, setGameId] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [message, setMessage] = useState("Enter your username to play");
  const [connectionError, setConnectionError] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [turnDeadline, setTurnDeadline] = useState<number | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][] | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  }, []);

  const startCountdown = useCallback(() => {
    stopCountdown();
    setCountdown(10);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          countdownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopCountdown]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`);
      const json = await res.json();
      if (json.data) {
        setLeaderboard(json.data);
      }
    } catch {
      console.error("Failed to fetch leaderboard");
    }
  }, []);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const applyGameState = useCallback(
    (game: any, player: string) => {
      setBoard(game.board);
      setCurrentPlayer(game.currentPlayer);
      setGameId(game.id);

      const myPlayerNum: Player = player === game.player1 ? 1 : 2;
      setPlayerNumber(myPlayerNum);

      const opponent =
        player === game.player1 ? game.player2 : game.player1;
      setOpponentName(opponent);
      setTurnDeadline(game.turnDeadline || null);
    },
    []
  );

  const handleMessage = useCallback(
    (data: any) => {
      const username = usernameRef.current;

      switch (data.type) {
        case "GAME_START": {
          setStatus("playing");
          stopCountdown();
          applyGameState(data.game, data.player);
          const opponent =
            data.player === data.game.player1
              ? data.game.player2
              : data.game.player1;
          setMessage(`Game started vs ${opponent}!`);
          break;
        }

        case "GAME_UPDATE": {
          setBoard(data.game.board);
          setCurrentPlayer(data.game.currentPlayer);
          setBoard(data.game.board);
          setCurrentPlayer(data.game.currentPlayer);
          setTurnDeadline(data.game.turnDeadline || null);
          break;
        }

        case "GAME_OVER": {
          setBoard(data.game.board);
          setWinningCells(data.winningCells || null);
          if (data.draw) {
            setStatus("draw");
            setWinner(null);
            setMessage("It's a draw!");
          } else if (data.winner) {
            setStatus("won");
            setWinner(data.winner);
            setMessage(
              data.winner === username
                ? "You win! 🎉"
                : `${data.winner} wins!`
            );
          }
          fetchLeaderboard();
          break;
        }

        case "GAME_RECONNECTED": {
          setStatus("playing");
          applyGameState(data.game, username);
          setMessage("Reconnected to game!");
          break;
        }

        case "OPPONENT_DISCONNECTED":
          setMessage("Opponent disconnected. Waiting for 30s...");
          break;

        case "OPPONENT_RECONNECTED":
          setMessage("Opponent reconnected! Resuming game.");
          break;

        case "WAITING":
          setMessage("Waiting for opponent...");
          startCountdown();
          break;

        case "ERROR":
          setMessage(data.message || "An error occurred.");
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    },
    [applyGameState, fetchLeaderboard]
  );

  const connect = useCallback(
    (username: string) => {
      usernameRef.current = username;
      setMessage("Connecting to server...");
      setStatus("waiting");
      setConnectionError(false);
      setBoard(createEmptyBoard());
      setWinner(null);

      try {
        const socket = new WebSocket(WS_URL);
        ws.current = socket;

        socket.onopen = () => {
          // Send JOIN_GAME message after connection is established
          socket.send(
            JSON.stringify({ type: "JOIN_GAME", username })
          );
          setMessage("Waiting for opponent...");
          startCountdown();
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleMessage(data);
          } catch {
            console.error("Failed to parse message:", event.data);
          }
        };

        socket.onclose = () => {
          setMessage("Disconnected from server.");
        };

        socket.onerror = () => {
          setMessage("Connection error. Is the backend running?");
          setConnectionError(true);
        };
      } catch {
        setMessage("Failed to connect. Check backend URL in src/config.ts");
        setConnectionError(true);
      }
    },
    [handleMessage]
  );

  const playBot = useCallback(
    (username: string) => {
      usernameRef.current = username;
      setMessage("Starting bot game...");
      setStatus("waiting");
      setConnectionError(false);
      setBoard(createEmptyBoard());
      setWinner(null);

      try {
        const socket = new WebSocket(WS_URL);
        ws.current = socket;

        socket.onopen = () => {
          socket.send(
            JSON.stringify({ type: "JOIN_BOT_GAME", username })
          );
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleMessage(data);
          } catch {
            console.error("Failed to parse message:", event.data);
          }
        };

        socket.onclose = () => {
          setMessage("Disconnected from server.");
        };

        socket.onerror = () => {
          setMessage("Connection error. Is the backend running?");
          setConnectionError(true);
        };
      } catch {
        setMessage("Failed to connect. Check backend URL in src/config.ts");
        setConnectionError(true);
      }
    },
    [handleMessage]
  );

  const dropDisc = useCallback((col: number) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ type: "MAKE_MOVE", column: col })
      );
    }
  }, []);

  const playAgain = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      // Tell backend to clean up old game
      ws.current.send(JSON.stringify({ type: "LEAVE_GAME" }));

      // Reset game state
      setBoard(createEmptyBoard());
      setWinningCells(null);
      setWinner(null);
      setPlayerNumber(null);
      setOpponentName("");
      setGameId("");
      setStatus("waiting");
      setMessage("Waiting for opponent...");
      startCountdown();

      // Re-join matchmaking with same username
      ws.current.send(
        JSON.stringify({ type: "JOIN_GAME", username: usernameRef.current })
      );
    } else {
      // Socket is closed, reconnect from scratch
      connect(usernameRef.current);
    }
  }, [connect]);

  const disconnect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "LEAVE_GAME" }));
    }
    ws.current?.close();
    ws.current = null;
    stopCountdown();
    setStatus("waiting");
    setBoard(createEmptyBoard());
    setBoard(createEmptyBoard());
    setWinningCells(null);
    setTurnDeadline(null);
    setWinner(null);
    setPlayerNumber(null);
    setMessage("Enter your username to play");
  }, [stopCountdown]);

  useEffect(() => {
    return () => {
      ws.current?.close();
    };
  }, []);

  return {
    board,
    currentPlayer,
    playerNumber,
    status,
    winner,
    opponentName,
    gameId,
    leaderboard,
    message,
    connectionError,
    countdown,
    turnDeadline,
    winningCells,
    connect,
    playBot,
    dropDisc,
    playAgain,
    disconnect,
  };
}
