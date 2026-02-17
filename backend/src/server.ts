import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";

// config
import { setupWebSocket } from "./config/websocket.config.js";
import { connectDB } from "./db/index.js";

// routes
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import gameRoutes from "./routes/game.routes.js";

// utility
import { ApiError } from "./utility/apiError.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

setupWebSocket(wss);

// ---- Routes ----

app.get("/", (_, res) => {
  res.send("Connect 4 Backend Running 🚀");
});

app.use("/api", leaderboardRoutes);
app.use("/api", gameRoutes);

// ---- Global Error Handler ----

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
    data: null,
  });
});

// ---- Start Server ----

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
