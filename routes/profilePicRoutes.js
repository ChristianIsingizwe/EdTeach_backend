import { Router } from "express";
import handleProfilePic from "../controllers/profilePicController.js";

const router = Router()

router.post('/profile-pic', handleProfilePic)

export default router; 