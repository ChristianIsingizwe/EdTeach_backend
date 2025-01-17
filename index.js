import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import verificationRoutes from './routes/verificationRoutes.js'
import challengeRoutes from './routes/challengeRoutes.js'

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth/", userRoutes);
app.use("/api/auth/codes", verificationRoutes)
app.use('/api/challenges', challengeRoutes)

const port = process.env.APP_PORT || 5000;
const mongoDBUri = process.env.MONGODB_URI;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectToDB(mongoDBUri);
});
