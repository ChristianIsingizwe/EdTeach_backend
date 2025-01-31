import request from "supertest";
import express from "express";
import {
  generalRateLimiter,
  authRateLimiter,
  adminRateLimiter,
} from "../middlewares/rateLimiter";

const app = express();
app.use("/general", generalRateLimiter, (req, res) =>
  res.json({ message: "General Access" })
);
app.use("/auth", authRateLimiter, (req, res) =>
  res.json({ message: "Auth Access" })
);
app.use("/admin", adminRateLimiter, (req, res) =>
  res.json({ message: "Admin Access" })
);

describe("Rate Limiter Middleware", () => {
  test("should allow requests within rate limit", async () => {
    const response = await request(app).get("/general");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "General Access" });
  });

  test("should block requests exceeding rate limit", async () => {
    for (let i = 0; i < 100; i++) {
      await request(app).get("/general");
    }
    const response = await request(app).get("/general");
    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      message: "Too many requests. Try again later",
    });
  });

  test("should allow authentication requests within rate limit", async () => {
    const response = await request(app).get("/auth");
    expect(response.status).toBe(200);
  });

  test("should block authentication requests exceeding rate limit", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).get("/auth");
    }
    const response = await request(app).get("/auth");
    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      message: "Too many authentication requests, please try again later",
    });
  });
});
