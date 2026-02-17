import type { Request, Response } from "express";
import { asyncHandler } from "../utility/asynchandler.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { ApiError } from "../utility/apiError.js";
import { leaderboardService } from "../services/leaderboard.service.js";

/**
 * GET /api/leaderboard?limit=10
 * Returns top players sorted by wins
 */
const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  if (limit < 1 || limit > 100) {
    throw ApiError.badRequest("Limit must be between 1 and 100");
  }

  const leaderboard = await leaderboardService.getLeaderboard(limit);

  res.status(200).json(
    new ApiResponse(leaderboard, "Leaderboard fetched successfully", 200)
  );
});

/**
 * GET /api/leaderboard/:username/history?limit=10
 * Returns match history for a player
 */
const getGameHistory = asyncHandler(async (req: Request, res: Response) => {
  const username = req.params.username as string;

  if (!username || username.trim().length === 0) {
    throw ApiError.badRequest("Username is required");
  }

  const limit = parseInt(req.query.limit as string) || 10;

  if (limit < 1 || limit > 100) {
    throw ApiError.badRequest("Limit must be between 1 and 100");
  }

  const history = await leaderboardService.getGameHistory(username, limit);

  res.status(200).json(
    new ApiResponse(history, `Game history for ${username}`, 200)
  );
});

export { getLeaderboard, getGameHistory };
