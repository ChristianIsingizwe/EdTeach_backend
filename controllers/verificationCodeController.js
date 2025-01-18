import {
  sendCodeSchema,
  verifyCodeSchema,
} from "../joiSchemas/verificationCodeSchemas.js";
import {
  generateVerificationCode,
  hashCode,
  verifyCode,
} from "../utils/verificationCode.js"; // Importing utility functions for verification code generation and validation.
import Verification from "../models/userOTPVerification.js"; // Importing the model for storing OTP verifications in the database.
import sendVerificationEmail from "../utils/emailSender.js"; // Importing the function to send verification emails.
import User from "../models/userModel.js";

/**
 * Controller to send a verification code to the user's email.
 *
 * This function validates the incoming request data, generates a verification code,
 * hashes it, stores it in the database, and then sends it via email to the user.
 *
 * @param {Object} req - The request object containing the user's information.
 * @param {Object} res - The response object to send a response to the client.
 * @returns {Object} - The response object with status and message.
 */
const sendCodes = async (req, res) => {
  // Validate the request body using the sendCodeSchema
  const { error, value } = sendCodeSchema.validate(req.body);

  // If validation fails, return a 400 status with the error message.
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userId, email } = value;

  try {
    // Generate a 6-digit verification code.
    const code = generateVerificationCode();

    // Hash the generated code before storing it to ensure security.
    const hashedCode = await hashCode(code);

    // Store the hashed code in the database against the userId.
    await Verification.create({ userId, code: hashedCode });

    // Send the verification email with the plain code.
    await sendVerificationEmail(email, code);

    // Respond with a success message if all steps complete without error.
    res.status(201).json({ message: "Verification code sent successfully." });
  } catch (error) {
    // Log the error for debugging purposes and respond with a failure message.
    console.error("Failed to send verification email ", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

/**
 * Controller to verify the user's verification code.
 *
 * This function validates the incoming request data, checks if the code provided
 * matches the stored hashed code, and deletes the verification record upon success.
 *
 * @param {Object} req - The request object containing the user's information and the code.
 * @param {Object} res - The response object to send a response to the client.
 * @returns {Object} - The response object with status and message.
 */
const verifyCodes = async (req, res) => {
  // Validate the request body using the verifyCodeSchema
  const { error, value } = verifyCodeSchema.validate(req.body, {
    abortEarly: false, // Abort validation after the first error (set to false to show all errors).
  });

  // If validation fails, return a 400 status with the error message.
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { userId, code } = value;

  try {
    // Check if there is an OTP record for the userId in the database.
    const record = await Verification.findOne({ userId });

    // If no record is found, it means the code might have expired or was never sent.
    if (!record) {
      return res
        .status(400)
        .json({ error: "Verification code expired or not found." });
    }

    // Verify the provided code against the stored hashed code.
    const isValid = await verifyCode(code, record.code);

    // If the verification fails, return an error.
    if (!isValid) {
      return res.status(400).json({ error: "Invalid verification code." });
    }
    // Updates the isVerified field into the database to true so as to mark the user as verified.
    await User.findByIdAndUpdate(userId, { isVerified: true });

    // Delete the verification record from the database after successful verification.
    await Verification.deleteOne({ userId });

    // Respond with a success message.
    res.status(201).json({ message: "Verification successful" });
  } catch (error) {
    // Log the error and respond with a failure message.
    console.error("Failed to verify the code ", error);
    res.status(500).json({ message: "Failed to verify the code." });
  }
};

// Exporting the functions to be used in routes.
export { sendCodes, verifyCodes };
