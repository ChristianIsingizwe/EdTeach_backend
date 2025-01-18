import Challenge from "../models/challengeModel";

const checkChallengeStatus = async (req, res, next) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "User not found" });
    }
    if (challenge.challengeStatus !== "open") {
      return res.status(400).json({
        message:
          "You can't join this challenge because it is either ongoing or completed",
      });
    }
    next();
  } catch (error) {
    console.error("Error checking challenge status: ", error);
    res.status(500).json({ error });
  }
};

export default checkChallengeStatus;
