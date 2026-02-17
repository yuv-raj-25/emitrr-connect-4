import { Router } from "express";
import { getLeaderboard, getGameHistory } from "../controllers/leaderboard.controller.js";

const router = Router();

router.get("/leaderboard", getLeaderboard);
router.get("/leaderboard/:username/history", getGameHistory);

export default router;
