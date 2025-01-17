import { Router } from "express";
import {
  sendCodes,
  verifyCodes,
} from "../controllers/verificationCodeController.js";

const router = Router();

router.post("/send-code", sendCodes);
router.post("/verify-code", verifyCodes);

export default router;
