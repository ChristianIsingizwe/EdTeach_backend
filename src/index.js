import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./config/db";
import userRoutes from "./routes/userRoutes";

dotenv.config();

app.use(cors());
app.use(express.json());
app.use("/api/auth/", userRoutes);

const port = process.env.APP_PORT || 5000;
const app = express();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectToDB(process.env.MONGODB_URI);
});
