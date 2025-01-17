import Joi from "joi";
import {
  generateVerificationCode,
  hashCode,
  verifyCode,
} from "../utils/verificationCode.js";
import Verification from "../models/userOTPVerification.js";
import sendVerificationEmail from "../utils/emailSender.js";

const sendCodeSchema = Joi.object({
  senderId: Joi.string().required(),
  email: Joi.string().email().required(),
});

const verifyCodeSchema = Joi.object({
  userId: Joi.string().required(),
  code: Joi.string().required(),
});

const sendCodes = async (req, res) => {
  const { error } = sendCodeSchema.validate();

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userId, email } = req.body;

  try {
    const code = generateVerificationCode();
    const hashedCode = await hashCode(code);

    await Verification.create({ userId, code: hashedCode });
    await sendVerificationEmail(email, code);

    res.status(201).json({ message: "Verification code sent successfully." });
  } catch (error) {
    console.error("Failed to send verification email ", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

const verifyCodes = async (req, res) => {
  const { error } = verifyCodeSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { userId, code } = req.body;

  try {
    const record = await Verification.findOne({ userId });
    if (!record) {
      return res.status(400).json({ error: "Verification code expired." });
    }

    const isValid = await verifyCode(code, record.code);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid don't match" });
    }

    await Verification.deleteOne({ userId });

    res.status(201).json({ message: "Verification successfull" });
  } catch (error) {
    console.error("Failed to verify the code ", error);
    res.status(500).json({ message: "Failed to  verify code. " });
  }
};

export { sendCodes, verifyCodes };
