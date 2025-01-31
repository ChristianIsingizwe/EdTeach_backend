const mongoose = require("mongoose");
const Challenge = require("../models/challengeModel");
const User = require("../models/userModel");
const {
  createChallengeService,
  editChallengeService,
  deleteChallengeService,
  findChallengeService,
  findChallengesService,
  joinChallengeService,
  leaveChallengeService,
} = require("../services/challengeService");

describe("Challenge Services Integration Tests", () => {
  let user;
  let challenge;

  beforeEach(async () => {
    user = new User({ username: "testuser", email: "test@example.com" });
    await user.save();

    challenge = new Challenge({
      title: "Test Challenge",
      description: "A test challenge",
      participants: [],
    });
    await challenge.save();
  });

  it("should create a new challenge successfully", async () => {
    const challengeData = {
      title: "New Challenge",
      description: "A new test challenge",
    };
    const newChallenge = await createChallengeService(challengeData);

    expect(newChallenge).toBeDefined();
    expect(newChallenge.title).toBe(challengeData.title);
  });

  it("should return null when editing a non-existing challenge", async () => {
    const updateData = { title: "Updated Challenge" };
    const updatedChallenge = await editChallengeService(
      new mongoose.Types.ObjectId(),
      updateData
    );
    expect(updatedChallenge).toBeNull();
  });

  it("should update an existing challenge successfully", async () => {
    const updateData = { title: "Updated Challenge" };
    const updatedChallenge = await editChallengeService(
      challenge._id,
      updateData
    );

    expect(updatedChallenge).toBeDefined();
    expect(updatedChallenge.title).toBe(updateData.title);
  });

  it("should delete a challenge successfully", async () => {
    const deletedChallenge = await deleteChallengeService(challenge._id);
    const foundChallenge = await Challenge.findById(challenge._id);

    expect(deletedChallenge).toBeDefined();
    expect(foundChallenge).toBeNull();
  });

  it("should return null when deleting a non-existing challenge", async () => {
    const deletedChallenge = await deleteChallengeService(
      new mongoose.Types.ObjectId()
    );
    expect(deletedChallenge).toBeNull();
  });

  it("should retrieve a challenge by ID", async () => {
    const foundChallenge = await findChallengeService(challenge._id);
    expect(foundChallenge).toBeDefined();
    expect(foundChallenge.title).toBe(challenge.title);
  });

  // ✅ TEST: Retrieve all challenges
  it("should retrieve all challenges", async () => {
    const challenges = await findChallengesService();
    expect(challenges.length).toBe(1);
  });

  it("should allow a user to join a challenge", async () => {
    const result = await joinChallengeService(user._id, challenge._id);

    expect(result).toBeDefined();
    expect(result.participants.includes(user._id)).toBeTruthy();

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.joinedChallenges.includes(challenge._id)).toBeTruthy();
  });

  it('should return "already_joined" if the user is already in the challenge', async () => {
    await joinChallengeService(user._id, challenge._id);
    const result = await joinChallengeService(user._id, challenge._id);
    expect(result).toBe("already_joined");
  });

  it("should allow a user to leave a challenge", async () => {
    await joinChallengeService(user._id, challenge._id);
    const result = await leaveChallengeService(user._id, challenge._id);
    expect(result).toBe(true);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.joinedChallenges.includes(challenge._id)).toBeFalsy();
  });

  it('should return "not_in_challenge" if the user is not in the challenge', async () => {
    const result = await leaveChallengeService(user._id, challenge._id);
    expect(result).toBe("not_in_challenge");
  });

  it("should return null when trying to join a non-existing challenge", async () => {
    const result = await joinChallengeService(
      user._id,
      new mongoose.Types.ObjectId()
    );
    expect(result).toBeNull();
  });

  it("should return null when trying to leave a non-existing challenge", async () => {
    const result = await leaveChallengeService(
      user._id,
      new mongoose.Types.ObjectId()
    );
    expect(result).toBeNull();
  });

  it("should return null when a non-existing user tries to join a challenge", async () => {
    const result = await joinChallengeService(
      new mongoose.Types.ObjectId(),
      challenge._id
    );
    expect(result).toBeNull();
  });

  it("should return null when a non-existing user tries to leave a challenge", async () => {
    const result = await leaveChallengeService(
      new mongoose.Types.ObjectId(),
      challenge._id
    );
    expect(result).toBeNull();
  });
});
