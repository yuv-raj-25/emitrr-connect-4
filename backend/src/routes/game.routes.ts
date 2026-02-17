import { Router } from "express";
import { getActiveGame } from "../controllers/game.controller.js";

const router = Router();

router.get("/game/:username", getActiveGame);

export default router;
