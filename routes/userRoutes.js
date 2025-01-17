import { Router } from "express";
import { loginUser, registerUser, updateUser } from "../controllers/userController.js";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.patch('/editProfile', updateUser)

export default router;
