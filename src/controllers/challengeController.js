import Challenge from "../models/challengeModel";
import {
  createChallengeSchema,
  editChallengeSchema,
} from "../joiSchemas/challengeSchemas";
import _ from "lodash";
import User from "../models/userModel";
import {
  deleteCachedData,
  getCachedData,
  setCachedData,
} from "../utils/caching ";

const cacheKeyForAllChallenges = `challenges:all`;

const createChallenge = async (req, res) => {
  try {
    const { error, value } = createChallengeSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({ error: errorMessages });
    }
    const { deadline } = value;
    if (new Date(deadline) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Deadline must be in the future." });
    }

    const newChallenge = new Challenge(value);
    await newChallenge.save();
    await deleteCachedData(cacheKeyForAllChallenges);
    res.status(201).json({
      message: "Challenge created successfully",
      challenge: newChallenge,
    });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = editChallengeSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message);
      return res.status(400).json({ error: errorMessage });
    }
    if (value.deadline && new Date(value.deadline) <= new Date()) {
      return res.status(400).json({ error: "Deadline must be in the future." });
    }

    const updateChallenge = await Challenge.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    if (!updateChallenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    const cacheKey = `challenge:${id}`;
    await setCachedData(cacheKey, updateChallenge);

    await deleteCachedData(cacheKeyForAllChallenges);

    res.status(200).json({
      message: "Challenge updated successfully.",
      challenge: updateChallenge,
    });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedChallenge = await Challenge.findByIdAndDelete(id);

    if (!deletedChallenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    await deleteCachedData(`challenge:${id}`);
    await deleteCachedData(cacheKeyForAllChallenges);
    res.status(200).json({
      message: "Challenge deleted successfully",
      challenge: deletedChallenge,
    });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const findChallenge = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `challenge:${id}`;

  try {
    const cachedChallenge = await getCachedData(cacheKey);
    if (cachedChallenge) {
      return res.status(200).json({ challenge: cachedChallenge });
    }
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ message: "Internal server error" });
    }
    await setCachedData(cacheKey, challenge);
    res.status(200).json({ challenge });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findChallenges = async (req, res) => {
  try {
    const cachedChallenges = await getCachedData(cacheKeyForAllChallenges);
    if (cachedChallenges) {
      return res.status(200).json({ challenges: cachedChallenges });
    }

    const challenges = await Challenge.find();
    if (!challenges) {
      return res.status(404).json({ message: "No challenges found" });
    }

    await setCachedData(cacheKey, challenges);
    res.status(200).json({ challenges });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const joinChallenge = async (req, res) => {
  try {
    const { userId, challengeId } = req.params;

    if (!userId || !challengeId) {
      return res
        .status(400)
        .json({ message: "Missing user ID or challenge ID" });
    }

    const user = await User.findById(userId);
    const challenge = await Challenge.findById(challengeId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    if (
      user.joinedChallenges.includes(challengeId) ||
      challenge.participants.includes(userId)
    ) {
      return res.status(400).json({ message: "User already joined. " });
    }

    user.joinedChallenges.push(challengeId);
    challenge.participants.push(userId);
    await user.save();
    await challenge.save();

    res.status(200).json({
      message: "Successfully joined the challenge",
      challenge,
    });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const leaveChallenge = async (req, res) => {
  const { challengeId, userId } = req.params;

  try {
    const user = await User.findById(userId);
    const challenge = await Challenge.findById(challengeId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const userInChallenge = user.joinedChallenges.includes(challengeId);

    if (!userInChallenge) {
      return res.status(400).json({ message: "User not in challenge." });
    }
    user.joinedChallenges = user.joinedChallenges.filter(
      (id) => id.toString() !== challengeId
    );
    await user.save();

    challenge.participants = challenge.participants.filter(
      (id) => id.toString() !== userId
    );
    await challenge.save();

    return res.status(200).json({ message: "User leaved successfully" });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export {
  createChallenge,
  editChallenge,
  deleteChallenge,
  findChallenge,
  findChallenges,
  joinChallenge,
  leaveChallenge,
};
