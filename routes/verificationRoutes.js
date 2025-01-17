import { Router } from "express";
import {
  sendCodes,
  verifyCodes,
} from "../controllers/verificationCodeController";

const router = Router();

router.post("/send-code", sendCodes);
router.post("/verify-code", verifyCodes);

export default router;
