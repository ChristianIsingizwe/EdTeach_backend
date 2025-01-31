import { Types } from "mongoose";
import Challenge, { findById } from "../models/challengeModel";
import User, { findById as _findById } from "../models/userModel";
import {
  createChallengeService,
  editChallengeService,
  deleteChallengeService,
  findChallengeService,
  findChallengesService,
  joinChallengeService,
  leaveChallengeService,
} from "../services/challengeService";

describe("Challenge Service Tests", () => {
  let user;
  let challenge;

  beforeEach(async () => {
    user = new User({ username: "testuser", email: "test@example.com" });
    await user.save();

    challenge = new Challenge({
      title: "Test Challenge",
      description: "A test challenge",
      participants: [],
      challengeStatus: "open",
    });
    await challenge.save();
  });

  describe("Create Challenge", () => {
    it("should create a new challenge successfully", async () => {
      const challengeData = {
        title: "New Challenge",
        description: "A new test challenge",
        challengeStatus: "open",
      };
      const newChallenge = await createChallengeService(challengeData);

      expect(newChallenge).toBeDefined();
      expect(newChallenge.title).toBe(challengeData.title);
      expect(newChallenge.challengeStatus).toBe("open");
    });
  });

  describe("Edit Challenge", () => {
    it("should update an existing challenge successfully", async () => {
      const updateData = {
        title: "Updated Challenge",
        challengeStatus: "ongoing",
      };
      const updatedChallenge = await editChallengeService(
        challenge._id,
        updateData
      );

      expect(updatedChallenge).toBeDefined();
      expect(updatedChallenge.title).toBe(updateData.title);
      expect(updatedChallenge.challengeStatus).toBe("ongoing");
    });

    it("should return null when editing a non-existing challenge", async () => {
      const updateData = { title: "Updated Challenge" };
      const updatedChallenge = await editChallengeService(
        new Types.ObjectId(),
        updateData
      );
      expect(updatedChallenge).toBeNull();
    });
  });

  describe("Delete Challenge", () => {
    it("should delete a challenge successfully", async () => {
      const deletedChallenge = await deleteChallengeService(challenge._id);
      const foundChallenge = await findById(challenge._id);

      expect(deletedChallenge).toBeDefined();
      expect(foundChallenge).toBeNull();
    });

    it("should return null when deleting a non-existing challenge", async () => {
      const deletedChallenge = await deleteChallengeService(
        new Types.ObjectId()
      );
      expect(deletedChallenge).toBeNull();
    });
  });

  describe("Find Challenges", () => {
    it("should retrieve a challenge by ID", async () => {
      const foundChallenge = await findChallengeService(challenge._id);
      expect(foundChallenge).toBeDefined();
      expect(foundChallenge.title).toBe(challenge.title);
    });

    it("should retrieve all challenges", async () => {
      const challenges = await findChallengesService();
      expect(challenges.length).toBeGreaterThan(0);
    });
  });

  describe("Join Challenge", () => {
    it("should allow a user to join a challenge", async () => {
      const result = await joinChallengeService(user._id, challenge._id);

      expect(result).toBeDefined();
      expect(result.participants.includes(user._id)).toBeTruthy();

      const updatedUser = await _findById(user._id);
      expect(updatedUser.joinedChallenges.includes(challenge._id)).toBeTruthy();
    });

    it("should return 'already_joined' if the user is already in the challenge", async () => {
      await joinChallengeService(user._id, challenge._id);
      const result = await joinChallengeService(user._id, challenge._id);
      expect(result).toBe("already_joined");
    });
  });

  describe("Leave Challenge", () => {
    it("should allow a user to leave a challenge", async () => {
      await joinChallengeService(user._id, challenge._id);
      const result = await leaveChallengeService(user._id, challenge._id);
      expect(result).toBe(true);

      const updatedUser = await _findById(user._id);
      expect(updatedUser.joinedChallenges.includes(challenge._id)).toBeFalsy();
    });

    it("should return 'not_in_challenge' if the user is not in the challenge", async () => {
      const result = await leaveChallengeService(user._id, challenge._id);
      expect(result).toBe("not_in_challenge");
    });
  });
});
