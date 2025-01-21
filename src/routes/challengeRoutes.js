import { Router } from "express";
import {
  createChallenge,
  deleteChallenge,
  joinChallenge,
  leaveChallenge,
} from "../controllers/challengeController.js";
import checkChallengeStatus from "../middlewares/checkChallengeStatus.js";

const router = Router();

router.post("/create", createChallenge);
router.post("/join/:userId/:challengeId", checkChallengeStatus, joinChallenge);
router.post("/leave/:userId/:challengeId", leaveChallenge);

router.delete("/delete/:id", deleteChallenge);

export default router;
