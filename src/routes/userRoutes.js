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

const router = Router();

router.get("/", findUsers);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/verifyOtp", verifyOTP);
router.get("/:id", findUser);
router.patch("/updateUser/:id", updateUser);
router.delete("/delete/:id", deleteUser);

export default router;
