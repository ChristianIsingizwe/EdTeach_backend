import { Router } from "express";
import {
  deleteUser,
  findUser,
  findUsers,
  loginUser,
  registerUser,
  updateUser,
  verifyOTP,
} from "../controllers/userController.js";
import authorize from "../middlewares/authorization.js";
import {
  authRateLimiter,
  generalRateLimiter,
} from "../middlewares/rateLimiting.js";
const router = Router();

router.get("/", authorize("user"), generalRateLimiter, findUsers);
router.post("/login", authRateLimiter, loginUser);
router.post("/register", authRateLimiter, registerUser);
router.post("/verifyOtp", authRateLimiter, verifyOTP);
router.get("/:id", authorize("user"), generalRateLimiter, findUser);
router.patch(
  "/updateUser/:id",
  authorize("user"),
  generalRateLimiter,
  updateUser
);
router.delete("/delete/:id", authorize("user"), authRateLimiter, deleteUser);

export default router;
