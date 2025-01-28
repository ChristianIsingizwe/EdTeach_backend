import "../instrument";
import "dotenv/config";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import { Redis } from "ioredis";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import connectToDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import challengeRoutes from "./routes/challengeRoutes";
import { generalRateLimiter } from "./middlewares/rateLimiting";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "Description of your API",
    },
    servers: [
      {
        url: "http://localhost:5001",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const app = express();
const redis = new Redis();
const swaggerSpec = swaggerJSDoc(options);

app.use(cors());
app.use(express.json());
app.use(generalRateLimiter);
app.use("/api/users/", userRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
