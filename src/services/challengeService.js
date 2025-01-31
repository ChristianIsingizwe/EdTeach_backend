import Challenge from "../models/challengeModel";
import User from "../models/userModel";
import {
  deleteCachedData,
  getCachedData,
  setCachedData,
} from "../utils/caching ";

const cacheKeyForAllChallenges = `challenges:all`;

const createChallengeService = async (challengeData) => {
  const newChallenge = new Challenge(challengeData);
  await newChallenge.save();
  await deleteCachedData(cacheKeyForAllChallenges);
  return newChallenge;
};

const editChallengeService = async (id, updateData) => {
  const challenge = await Challenge.findById(id);

  if (!challenge) {
    return null;
  }

  if (updateData.challengeStatus) {
    const validTransitions = {
      open: ["ongoing"],
      ongoing: ["closed"],
      closed: [],
    };

    if (
      !validTransitions[challenge.challengeStatus].includes(
        updateData.challengeStatus
      )
    ) {
      throw new Error(
        `Invalid status transition from '${challenge.challengeStatus}' to '${updateData.challengeStatus}'.`
      );
    }
  }

  const updatedChallenge = await Challenge.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (updatedChallenge) {
    const cacheKey = `challenge:${id}`;
    await setCachedData(cacheKey, updatedChallenge);
    await deleteCachedData(cacheKeyForAllChallenges);
  }

  return updatedChallenge;
};

const deleteChallengeService = async (id) => {
  const deletedChallenge = await Challenge.findByIdAndDelete(id);
  if (deletedChallenge) {
    await deleteCachedData(`challenge:${id}`);
    await deleteCachedData(cacheKeyForAllChallenges);
  }
  return deletedChallenge;
};

const findChallengeService = async (id) => {
  const cacheKey = `challenge:${id}`;
  const cachedChallenge = await getCachedData(cacheKey);
  if (cachedChallenge) return cachedChallenge;

  const challenge = await Challenge.findById(id);
  if (challenge) await setCachedData(cacheKey, challenge);

  return challenge;
};

const findChallengesService = async () => {
  const cachedChallenges = await getCachedData(cacheKeyForAllChallenges);
  if (cachedChallenges) return cachedChallenges;

  const challenges = await Challenge.find();
  if (challenges.length)
    await setCachedData(cacheKeyForAllChallenges, challenges);

  return challenges;
};

const joinChallengeService = async (userId, challengeId) => {
  const user = await User.findById(userId);
  const challenge = await Challenge.findById(challengeId);
  if (!user || !challenge) return null;

  if (user.joinedChallenges.includes(challengeId)) return "already_joined";

  user.joinedChallenges.push(challengeId);
  challenge.participants.push(userId);

  await user.save();
  await challenge.save();

  return challenge;
};

const leaveChallengeService = async (userId, challengeId) => {
  const user = await User.findById(userId);
  const challenge = await Challenge.findById(challengeId);
  if (!user || !challenge) return null;

  if (!user.joinedChallenges.includes(challengeId)) return "not_in_challenge";

  user.joinedChallenges = user.joinedChallenges.filter(
    (id) => id.toString() !== challengeId
  );
  challenge.participants = challenge.participants.filter(
    (id) => id.toString() !== userId
  );

  await user.save();
  await challenge.save();

  return true;
};

export {
  createChallengeService,
  editChallengeService,
  deleteChallengeService,
  findChallengeService,
  findChallengesService,
  joinChallengeService,
  leaveChallengeService,
};
