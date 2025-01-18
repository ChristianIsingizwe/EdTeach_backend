import Challenge from "../models/challengeModel.js";
import {
  createChallengeSchema,
  editChallengeSchema,
} from "../joiSchemas/challengeSchemas.js";
import _ from "lodash";
import User from "../models/userModel.js";

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
    res.status(201).json({ message: "Challenge created successfully" });
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
    const deletedChallenge = Challenge.findByIdAndDelete(id);

    if (!deletedChallenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
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

  const challenge = Challenge.findById(id);
  if (!challenge) {
    return res.status(404).json({ message: "Internal server error" });
  }

  res.status(200).json({ challenge });
};

const findChallenges = async (req, res) => {
  const challenges = Challenge.find();
  if (!challenges) {
    return res.status(404).json({ message: "No challenge found" });
  }

  res.status(200).json({ challenges });
};

const joinChallenge = async (req, res) => {
  try {
    const { userId, challengeId } = _.pick(req.body, ["userId", "challengeId"]);

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

    if (user.joinedChallenges.includes(challengeId)) {
      return res.status(400).json({ message: "User already joined. " });
    }

    user.joinedChallenges.push(challengeId);
    await user.save();

    res.status(200).json({
      message: "Successfully joined the challenge",
      userId,
      challengeId,
    });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getUsersInChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;

    if (!challengeId) {
      return res.status(400).json({
        error: "Challenge ID is required.",
      });
    }

    const challenge = await Challenge.findById(challengeId).populate(
      "participants"
    );

    if (!challenge) {
      return res.status(404).json({
        error: "Challenge not found.",
      });
    }

    const users = challenge.participants;

    if (users.length === 0) {
      return res.status(200).json({
        message: "No users have joined this challenge yet.",
      });
    }

    res.status(200).json({
      message: "Users who have joined the challenge.",
      users: users.map((user) => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      })),
    });
  } catch (error) {
    console.error("Error fetching users in challenge:", error);
    res.status(500).json({
      error: "An error occurred while fetching users.",
      details: error.message,
    });
  }
};

export {
  createChallenge,
  editChallenge,
  deleteChallenge,
  findChallenge,
  findChallenges,
  joinChallenge,
  getUsersInChallenge,
};
