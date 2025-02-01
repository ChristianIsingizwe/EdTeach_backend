import request from "supertest";
import express from "express";
import checkChallengeStatus from "../middlewares/checkChallengeStatus";
import Challenge from "../models/challengeModel";

jest.mock("../models/challengeModel");

const app = express();
app.use("/test/:challengeId", checkChallengeStatus, (req, res) => {
  res.status(200).json({ message: "Challenge open" });
});

describe("Check Challenge Status Middleware", () => {
  test("should return 404 if challenge is not found", async () => {
    Challenge.findById.mockResolvedValue(null);

    const response = await request(app).get("/test/60d21b4667d0d8992e610c85");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "User not found" });
  });

  test("should return 400 if challenge is not open", async () => {
    Challenge.findById.mockResolvedValue({ challengeStatus: "ongoing" });

    const response = await request(app).get("/test/60d21b4667d0d8992e610c85");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message:
        "You can't join this challenge because it is either ongoing or completed",
    });
  });

  test("should proceed to next middleware if challenge is open", async () => {
    Challenge.findById.mockResolvedValue({ challengeStatus: "open" });

    const response = await request(app).get("/test/60d21b4667d0d8992e610c85");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Challenge open" });
  });
});
