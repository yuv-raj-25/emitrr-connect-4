import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";

// routes
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import gameRoutes from "./routes/game.routes.js";

// utility
import { ApiError } from "./utility/apiError.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : false,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.get("/", (_, res) => {
  res.send("Connect 4 Backend Running 🚀");
});

app.use("/api", leaderboardRoutes);
app.use("/api", gameRoutes);

// Global Error Handler
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

export { app };
