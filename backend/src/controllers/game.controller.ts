import type { Request, Response } from "express";
import { asyncHandler } from "../utility/asynchandler.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { ApiError } from "../utility/apiError.js";
import { gameService } from "../services/game.service.js";

/**
 * GET /api/game/:username
 * Returns the current in-memory game for a player (if any)
 */
const getActiveGame = asyncHandler(async (req: Request, res: Response) => {
  const username = req.params.username as string;

  if (!username || username.trim().length === 0) {
    throw ApiError.badRequest("Username is required");
  }

  const game = gameService.getGameByPlayer(username);

  if (!game) {
    throw ApiError.notFound(`No active game found for ${username}`);
  }

  res.status(200).json(
    new ApiResponse(game, "Active game fetched successfully", 200)
  );
});

export { getActiveGame };
