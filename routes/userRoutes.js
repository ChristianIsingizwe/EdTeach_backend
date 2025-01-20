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

const router = Router();

router.get("/", authorize(), findUsers);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/verifyOtp", verifyOTP);
router.get("/:id", authorize(), findUser);
router.patch("/updateUser/:id", authorize(), updateUser);
router.delete("/delete/:id", authorize(), deleteUser);

export default router;
