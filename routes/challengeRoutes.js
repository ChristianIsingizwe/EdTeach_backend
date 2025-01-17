import { Router } from "express";
import {
  createChallenge,
  deleteChallenge,
  editChallenge,
} from "../controllers/challengeController";

const router = Router();

router.post("/create", createChallenge);
router.patch("/update", editChallenge);
router.delete("/delete", deleteChallenge);

export default router;
