import request from "supertest";
import express from "express";
import validateObjectId from "../middlewares/validateObjectId";

const app = express();
app.get("/test/:id", validateObjectId, (req, res) =>
  res.json({ message: "Valid ID" })
);

describe("Validate Object ID Middleware", () => {
  test("should return 404 for an invalid ObjectId", async () => {
    const response = await request(app).get("/test/invalid-id");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Invalid ID" });
  });

  test("should proceed to next middleware for valid ObjectId", async () => {
    const validId = "60d21b4667d0d8992e610c85";
    const response = await request(app).get(`/test/${validId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Valid ID" });
  });
});
