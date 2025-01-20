import { Router } from "express";
import {
  createChallenge,
  deleteChallenge,
  editChallenge,
  getUsersInChallenge,
  joinChallenge,
  leaveChallenge,
} from "../controllers/challengeController.js";

const router = Router();

/**
 * @module ChallengeRoutes
 * This module defines the API endpoints for managing challenges on the platform.
 */

/**
 * @route POST /challenges/create
 * @description Creates a new challenge.
 * @access Admin
 * @example
 * Request body:
 * {
 *   "title": "Code Marathon",
 *   "deadline": "2025-12-31T23:59:59.999Z",
 *   "duration": 30,
 *   "moneyPrize": 1000,
 *   "status": "open",
 *   "contactEmail": "admin@example.com",
 *   "projectDescription": "Build a scalable web app",
 *   "projectBrief": "A brief description",
 *   "projectTasks": ["Design UI", "Implement backend"],
 * }
 */
router.post("/create", createChallenge);
router.post("/join/:userId/:challengeId", joinChallenge);
router.post("/leave/:userId/:challengeId", leaveChallenge)

/**
 * @route PUT /challenges/update
 * @description Updates an existing challenge.
 * @access Admin
 * @example
 * Request body:
 * {
 *   "id": "challengeId",
 *   "updates": {
 *     "status": "ongoing"
 *   }
 * }
 */
router.get("/getUsersJoined/:id", getUsersInChallenge);
router.patch("/update/:id", editChallenge);

/**
 * @route DELETE /challenges/delete
 * @description Deletes a challenge.
 * @access Admin
 * @example
 * Request body:
 * {
 *   "id": "challengeId"
 * }
 */

router.delete("/delete/:id", deleteChallenge);

export default router;
