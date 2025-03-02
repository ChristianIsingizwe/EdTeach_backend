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
import validateObjectId from "../middlewares/validateObjectId.js";
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

router.patch(
  "/edit/:id",
  authorize("admin"),
  validateObjectId,
  adminRateLimiter,
  editChallenge
);

router.get(
  "/:id",
  validateObjectId,
  generalRateLimiter,
  cacheMiddlware(() => `challenge:${req.params.id}`),
  findChallenge
);

router.put(
  "/join/:userId/:challengeId",
  authorize("user"),
  generalRateLimiter,
  checkChallengeStatus,
  joinChallenge
);

router.delete(
  "/leave/:userId/:challengeId",
  authorize("user"),
  generalRateLimiter,
  leaveChallenge
);

router.delete(
  "/delete/:id",
  authorize("admin"),
  validateObjectId,
  adminRateLimiter,
  deleteChallenge
);

export default router;
