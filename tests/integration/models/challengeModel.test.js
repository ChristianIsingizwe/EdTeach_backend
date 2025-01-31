import mongoose from "mongoose";
import mockingoose from "mockingoose";
import Challenge from "../models/challengeModel";

describe("Challenge Model Tests", () => {
  afterEach(() => {
    mockingoose.resetAll();
  });

  it("should create a challenge with valid data", async () => {
    const validChallenge = new Challenge({
      title: "AI Innovation Challenge",
      deadline: new Date(Date.now() + 86400000),
      duration: "3 weeks",
      moneyPrize: "5000 USD",
      challengeStatus: "open",
      contactEmail: "test@example.com",
      projectDescription: "A challenge to develop AI solutions.",
      projectBrief: "Build an AI model that...",
      projectTasks: ["Task 1", "Task 2"],
      participants: [new mongoose.Types.ObjectId()],
    });

    await expect(validChallenge.validate()).resolves.toBeUndefined();
  });

  test("should fail validation if required fields are missing", async () => {
    const invalidChallenge = new Challenge({});

    await expect(invalidChallenge.validate()).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  test("should fail validation if deadline is in the past", async () => {
    const invalidChallenge = new Challenge({
      title: "Expired Challenge",
      deadline: new Date(Date.now() - 86400000),
      duration: "2 weeks",
      moneyPrize: "2000 USD",
      challengeStatus: "open",
      contactEmail: "test@example.com",
      projectDescription: "An expired challenge.",
      projectBrief: "Details about the expired challenge.",
      projectTasks: ["Task 1"],
    });

    await expect(invalidChallenge.validate()).rejects.toThrow(
      /Deadline must be in the future/
    );
  });

  test("should fail validation for invalid email format", async () => {
    const invalidChallenge = new Challenge({
      title: "AI Challenge",
      deadline: new Date(Date.now() + 86400000),
      duration: "2 weeks",
      moneyPrize: "1000 USD",
      challengeStatus: "open",
      contactEmail: "invalid-email", // Invalid format
      projectDescription: "A challenge with an invalid email.",
      projectBrief: "Brief about the challenge.",
      projectTasks: ["Task 1"],
    });

    await expect(invalidChallenge.validate()).rejects.toThrow(/is invalid/);
  });

  test("should fail validation if challengeStatus has an invalid value", async () => {
    const invalidChallenge = new Challenge({
      title: "Invalid Status Challenge",
      deadline: new Date(Date.now() + 86400000),
      duration: "2 weeks",
      moneyPrize: "3000 USD",
      challengeStatus: "not_valid", // Invalid value
      contactEmail: "test@example.com",
      projectDescription: "A challenge with invalid status.",
      projectBrief: "Brief about the challenge.",
      projectTasks: ["Task 1"],
    });

    await expect(invalidChallenge.validate()).rejects.toThrow(
      /is not a valid enum value/
    );
  });

  test("should allow adding participants as references", async () => {
    const participantId = new mongoose.Types.ObjectId();
    const challenge = new Challenge({
      title: "Participant Test",
      deadline: new Date(Date.now() + 86400000),
      duration: "3 weeks",
      moneyPrize: "5000 USD",
      challengeStatus: "open",
      contactEmail: "test@example.com",
      projectDescription: "Testing participants array",
      projectBrief: "Testing...",
      projectTasks: ["Task 1"],
      participants: [participantId],
    });

    await expect(challenge.validate()).resolves.toBeUndefined();
  });

  test("should return a challenge when queried from the database", async () => {
    const challengeData = {
      _id: new mongoose.Types.ObjectId(),
      title: "Database Challenge",
      deadline: new Date(Date.now() + 86400000),
      duration: "2 weeks",
      moneyPrize: "4000 USD",
      challengeStatus: "open",
      contactEmail: "test@example.com",
      projectDescription: "Challenge from DB",
      projectBrief: "Brief...",
      projectTasks: ["Task 1"],
      participants: [],
    };

    mockingoose(Challenge).toReturn(challengeData, "findOne");

    const foundChallenge = await Challenge.findOne({ _id: challengeData._id });

    expect(foundChallenge.title).toBe("Database Challenge");
    expect(foundChallenge.moneyPrize).toBe("4000 USD");
    expect(foundChallenge.participants.length).toBe(0);
  });

  test("should return null if challenge is not found", async () => {
    mockingoose(Challenge).toReturn(null, "findOne");

    const foundChallenge = await Challenge.findOne({
      _id: new mongoose.Types.ObjectId(),
    });

    expect(foundChallenge).toBeNull();
  });
});
