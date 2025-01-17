import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth/", userRoutes);

const port = process.env.APP_PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectToDB('mongodb://localhost:27017/umurava');
});
