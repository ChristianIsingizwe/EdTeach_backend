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
} from "../middlewares/cacheMiddleware.js";
const router = Router();

router.get("/", authorize(), generalRateLimiter, findUsers);
router.post("/login", authRateLimiter, loginUser);
router.post("/register", authRateLimiter, registerUser);
router.post("/verifyOtp", authRateLimiter, verifyOTP);
router.get("/:id", authorize(), generalRateLimiter, findUser);
router.patch("/updateUser/:id", authorize(), generalRateLimiter, updateUser);
router.delete("/delete/:id", authorize(), authRateLimiter, deleteUser);

export default router;
