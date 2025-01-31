import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import {
  createChallenge,
  editChallenge,
  deleteChallenge,
  findChallenge,
  findChallenges,
  joinChallenge,
  leaveChallenge,
} from "../controllers/challengeController";
import Challenge from "../models/challengeModel";
import {
  createChallengeService,
  joinChallengeService,
  leaveChallengeService,
} from "../services/challengeService";
import mockingoose from "mockingoose";

jest.mock("../services/challengeService");

const app = express();
app.use(express.json());

app.post("/challenge", createChallenge);
app.patch("/challenge/:id", editChallenge);
app.delete("/challenge/:id", deleteChallenge);
app.get("/challenge/:id", findChallenge);
app.get("/challenges", findChallenges);
app.put("/challenge/join/:userId/:challengeId", joinChallenge);
app.delete("/challenge/leave/:userId/:challengeId", leaveChallenge);

describe("Challenge Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Create Challenge", () => {
    test("should create a challenge successfully", async () => {
      const challengeData = {
        title: "New Challenge",
        description: "Test challenge",
        deadline: new Date(Date.now() + 86400000), // 1 day in the future
      };

      createChallengeService.mockResolvedValue(challengeData);

      const response = await request(app)
        .post("/challenge")
        .send(challengeData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Challenge created successfully"
      );
      expect(response.body).toHaveProperty("challenge");
    });

    test("should return 400 for invalid input", async () => {
      const response = await request(app).post("/challenge").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should return 400 if deadline is in the past", async () => {
      const challengeData = {
        title: "Old Challenge",
        description: "Past deadline",
        deadline: new Date(Date.now() - 86400000), // 1 day in the past
      };

      const response = await request(app)
        .post("/challenge")
        .send(challengeData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Deadline must be in the future."
      );
    });
  });

  describe("Edit Challenge", () => {
    test("should edit a challenge successfully", async () => {
      const challengeId = new mongoose.Types.ObjectId();
      const updatedData = { title: "Updated Challenge" };

      editChallengeService.mockResolvedValue(updatedData);

      const response = await request(app)
        .patch(`/challenge/${challengeId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Challenge updated successfully."
      );
    });

    test("should return 400 for invalid update data", async () => {
      const challengeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/challenge/${challengeId}`)
        .send({ deadline: "invalid-date" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should return 404 if challenge is not found", async () => {
      const challengeId = new mongoose.Types.ObjectId();
      editChallengeService.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/challenge/${challengeId}`)
        .send({ title: "New Title" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Challenge not found");
    });
  });

  describe("Delete Challenge", () => {
    test("should delete a challenge successfully", async () => {
      const challengeId = new mongoose.Types.ObjectId();
      deleteChallengeService.mockResolvedValue({});

      const response = await request(app).delete(`/challenge/${challengeId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Challenge deleted successfully"
      );
    });

    test("should return 404 if challenge is not found", async () => {
      const challengeId = new mongoose.Types.ObjectId();
      deleteChallengeService.mockResolvedValue(null);

      const response = await request(app).delete(`/challenge/${challengeId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Challenge not found");
    });
  });

  describe("Find Challenge", () => {
    test("should return challenge details", async () => {
      const challengeId = new mongoose.Types.ObjectId();
      mockingoose(Challenge).toReturn(
        { title: "Existing Challenge" },
        "findOne"
      );

      const response = await request(app).get(`/challenge/${challengeId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("challenge");
    });

    test("should return 404 if challenge is not found", async () => {
      const challengeId = new mongoose.Types.ObjectId();
      mockingoose(Challenge).toReturn(null, "findOne");

      const response = await request(app).get(`/challenge/${challengeId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Challenge not found");
    });
  });

  describe("Join Challenge", () => {
    test("should allow user to join a challenge", async () => {
      const userId = new mongoose.Types.ObjectId();
      const challengeId = new mongoose.Types.ObjectId();
      joinChallengeService.mockResolvedValue({});

      const response = await request(app).put(
        `/challenge/join/${userId}/${challengeId}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Successfully joined the challenge"
      );
    });

    test("should return 400 if user already joined", async () => {
      const userId = new mongoose.Types.ObjectId();
      const challengeId = new mongoose.Types.ObjectId();
      joinChallengeService.mockResolvedValue("already_joined");

      const response = await request(app).put(
        `/challenge/join/${userId}/${challengeId}`
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "User already joined.");
    });

    test("should return 404 if challenge is not found", async () => {
      const userId = new mongoose.Types.ObjectId();
      const challengeId = new mongoose.Types.ObjectId();
      joinChallengeService.mockResolvedValue(null);

      const response = await request(app).put(
        `/challenge/join/${userId}/${challengeId}`
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "User or challenge not found"
      );
    });
  });

  describe("Leave Challenge", () => {
    test("should allow user to leave a challenge", async () => {
      const userId = new mongoose.Types.ObjectId();
      const challengeId = new mongoose.Types.ObjectId();
      leaveChallengeService.mockResolvedValue({});

      const response = await request(app).delete(
        `/challenge/leave/${userId}/${challengeId}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "User left successfully");
    });

    test("should return 400 if user is not in challenge", async () => {
      const userId = new mongoose.Types.ObjectId();
      const challengeId = new mongoose.Types.ObjectId();
      leaveChallengeService.mockResolvedValue("not_in_challenge");

      const response = await request(app).delete(
        `/challenge/leave/${userId}/${challengeId}`
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "User not in challenge.");
    });
  });
});
