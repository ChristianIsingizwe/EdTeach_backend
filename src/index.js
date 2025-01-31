import "../instrument";
import "dotenv/config";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import { Redis } from "ioredis";

import connectToDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import challengeRoutes from "./routes/challengeRoutes";
import { generalRateLimiter } from "./middlewares/rateLimiting";

const app = express();
const redis = new Redis();

app.use(cors());
app.use(express.json());
app.use(generalRateLimiter);
app.use("/api/v1/users/", userRoutes);
app.use("/api/v1/challenges", challengeRoutes);

Sentry.setupExpressErrorHandler(app);
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

const port = process.env.APP_PORT || 5000;
const mongoDBUri = process.env.MONGODB_URI;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectToDB(mongoDBUri);
});

export { redis };
