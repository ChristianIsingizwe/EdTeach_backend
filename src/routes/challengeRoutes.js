import { Router } from "express";
import {
  createChallenge,
  deleteChallenge,
  editChallenge,
  findChallenge,
  findChallenges,
  joinChallenge,
  leaveChallenge,
} from "../controllers/challengeController.js";
import authorize from "../middlewares/authorization.js";
import checkChallengeStatus from "../middlewares/checkChallengeStatus.js";

const router = Router();

router.get("/", findChallenges);
router.post("/create", authorize("admin"), createChallenge);
router.patch("/edit", authorize("admin"), editChallenge);
router.get("/:id", findChallenge);
router.put(
  "/join/:userId/:challengeId",
  authorize(),
  checkChallengeStatus,
  joinChallenge
);
router.delete("/leave/:userId/:challengeId", authorize(), leaveChallenge);
router.delete("/delete/:id", authorize("admin"), deleteChallenge);

export default router;
