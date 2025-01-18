import Challenge from "../models/challengeModel";
import {
  createChallengeSchema,
  editChallengeSchema,
} from "../joiSchemas/challengeSchemas";

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
      return res.status(400).json({ error: "Error must be in the future." });
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

export {
  createChallenge,
  editChallenge,
  deleteChallenge,
  findChallenge,
  findChallenges,
};
