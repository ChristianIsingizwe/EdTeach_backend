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
import cacheMiddlware from "../middlewares/cacheMiddleware.js";
import {
  adminRateLimiter,
  generalRateLimiter,
} from "../middlewares/rateLimiting.js";

const router = Router();

router.get(
  "/",
  generalRateLimiter,
  cacheMiddlware(() => `challenge:all`),
  findChallenges
);
router.post("/create", authorize("admin"), adminRateLimiter, createChallenge);
router.patch("/edit", authorize("admin"), adminRateLimiter, editChallenge);
router.get(
  "/:id",
  generalRateLimiter,
  cacheMiddlware(() => `challenge:${req.params.id}`),
  findChallenge
);
router.put(
  "/join/:userId/:challengeId",
  authorize(),
  generalRateLimiter,
  checkChallengeStatus,
  joinChallenge
);
router.delete(
  "/leave/:userId/:challengeId",
  authorize(),
  generalRateLimiter,
  leaveChallenge
);
router.delete(
  "/delete/:id",
  authorize("admin"),
  adminRateLimiter,
  deleteChallenge
);

export default router;
