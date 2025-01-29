import {
  createChallengeService,
  editChallengeService,
  deleteChallengeService,
  findChallengeService,
  findChallengesService,
  joinChallengeService,
  leaveChallengeService,
} from "../services/challengeService";
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
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message) });
    }

    if (new Date(value.deadline) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Deadline must be in the future." });
    }

    const challenge = await createChallengeService(value);
    res
      .status(201)
      .json({ message: "Challenge created successfully", challenge });
  } catch (error) {
    console.error("Error: ", error);
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
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message) });
    }

    if (value.deadline && new Date(value.deadline) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Deadline must be in the future." });
    }

    const challenge = await editChallengeService(id, value);
    if (!challenge)
      return res.status(404).json({ error: "Challenge not found" });

    res
      .status(200)
      .json({ message: "Challenge updated successfully.", challenge });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteChallenge = async (req, res) => {
  try {
    
    const challenge = await deleteChallengeService(req.params.id);
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });

    res
      .status(200)
      .json({ message: "Challenge deleted successfully", challenge });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const findChallenge = async (req, res) => {
  try {
    const challenge = await findChallengeService(req.params.id);
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });

    res.status(200).json({ challenge });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findChallenges = async (req, res) => {
  try {
    const challenges = await findChallengesService();
    res.status(200).json({ challenges });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const joinChallenge = async (req, res) => {
  try {
    const result = await joinChallengeService(
      req.params.userId,
      req.params.challengeId
    );

    if (!result)
      return res.status(404).json({ message: "User or challenge not found" });
    if (result === "already_joined")
      return res.status(400).json({ message: "User already joined." });

    res.status(200).json({
      message: "Successfully joined the challenge",
      challenge: result,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const leaveChallenge = async (req, res) => {
  try {
    const result = await leaveChallengeService(
      req.params.userId,
      req.params.challengeId
    );

    if (!result)
      return res.status(404).json({ message: "User or challenge not found" });
    if (result === "not_in_challenge")
      return res.status(400).json({ message: "User not in challenge." });

    res.status(200).json({ message: "User left successfully" });
  } catch (error) {
    console.error("Error: ", error);
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
