import { Router } from "express";
import {
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/userController.js";
import authorize from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.patch("/editProfile", authorize, updateUser);

export default router;
