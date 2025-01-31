import request from "supertest";
import express from "express";
import cacheMiddleware from "../middlewares/cacheMiddleware";

jest.mock("../index", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const { redis } = require("../index");

const app = express();
app.use(
  "/test",
  cacheMiddleware((req) => `cache:test:${req.query.key}`),
  (req, res) => res.json({ message: "Success" })
);

describe("Cache Middleware", () => {
  test("should return cached data when cache exists", async () => {
    redis.get.mockResolvedValue(JSON.stringify({ message: "Cached Data" }));

    const response = await request(app).get("/test?key=123");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Cached Data" });
    expect(redis.get).toHaveBeenCalledWith("cache:test:123");
  });

  test("should proceed to next middleware when no cache exists", async () => {
    redis.get.mockResolvedValue(null);

    const response = await request(app).get("/test?key=456");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Success" });
    expect(redis.get).toHaveBeenCalledWith("cache:test:456");
  });

  test("should proceed to next middleware on Redis error", async () => {
    redis.get.mockRejectedValue(new Error("Redis error"));

    const response = await request(app).get("/test?key=789");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Success" });
  });
});
