import { Router } from "express";
import handleProfilePic from "../controllers/profilePicController";

const router = Router()

router.post('/profile-pic', handleProfilePic)

export default router; 