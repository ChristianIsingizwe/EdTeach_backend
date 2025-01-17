import Joi from "joi"; // Importing Joi for schema validation.
import User from "../models/userModel.js"; // Importing User model to interact with the database.
import { hashPassword, verifyPassword } from "../utils/passwordHelper.js"; // Importing utility functions to hash and verify passwords.
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js"; // Importing functions for token generation.
import _ from "lodash"; // Importing lodash to simplify object manipulation.

/**
 * Schema for validating the user registration data.
 * It ensures that the first name, last name, email, and password meet the required format and constraints.
 */
const registerUserSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .required(), // The first name must contain only alphabetic characters and be between 2-255 characters.
  lastName: Joi.string()
    .min(2)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .required(), // The last name must contain only alphabetic characters and be between 2-255 characters.
  email: Joi.string().email().required(), // The email must be in a valid email format.
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .required(), // Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character.
  role: Joi.string().valid("user", "admin").default("user").optional(), // The role is optional and defaults to 'user'.
});

/**
 * Schema for validating the user login data.
 * Ensures the email and password are provided and meet the required format.
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(), // The email must be in a valid email format.
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&/])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .required(), // The password must be at least 8 characters long and contain specific characters.
});

/**
 * Schema for validating the user update data.
 * It validates the user's first name, last name, and password changes.
 */
const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .min(3)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .optional(), // The first name is optional and must be between 3-255 characters.
  lastName: Joi.string()
    .min(3)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .optional(), // The last name is optional and must be between 3-255 characters.
  currentPassword: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .optional(), // The current password is optional and must meet the specified pattern.
  newPassword: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .optional(), // The new password is optional and must meet the specified pattern.
  profilePic: Joi.string().uri().optional(), // The profile picture URL is optional.
});

/**
 * Controller to handle user registration.
 *
 * This function validates the registration data, checks if the user already exists, hashes the password,
 * creates a new user in the database, and generates access and refresh tokens.
 *
 * @param {Object} req - The request object containing the user data.
 * @param {Object} res - The response object to send the response to the client.
 * @returns {Object} - The response object with the status and user data (with tokens).
 */
const registerUser = async (req, res) => {
  try {
    // Validate the registration data using the registerUserSchema.
    const { error, value } = registerUserSchema.validate(req.body, {
      abortEarly: false, // Collect all validation errors instead of stopping at the first error.
    });

    // If validation fails, return 400 status with error messages.
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({ error: errorMessages });
    }

    // Destructure the validated values.
    const { firstName, lastName, email, password, role } = _.pick(value, [
      "firstName",
      "lastName",
      "email",
      "password",
      "role",
    ]);

    // Check if a user with the same email already exists in the database.
    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password before storing it in the database.
    const hashedPassword = await hashPassword(password);

    // Create a new user in the database with the provided data.
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role,
    });

    // Generate an access token and a refresh token for the new user.
    const accessToken = generateAccessToken({
      userId: newUser._id,
      userRole: newUser.role,
    });
    const refreshToken = generateRefreshToken(
      { userId: newUser._id },
      newUser.tokenVersion
    );

    // Return the user data along with the generated tokens.
    res
      .status(201)
      .json({ firstName, lastName, email, accessToken, refreshToken });
  } catch (error) {
    // Log any unexpected errors and return a 500 status.
    console.error("An error occurred while registering the user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Controller to handle user login.
 *
 * This function validates the login data, checks if the user exists, verifies the password,
 * and generates access and refresh tokens.
 *
 * @param {Object} req - The request object containing the login data.
 * @param {Object} res - The response object to send the response to the client.
 * @returns {Object} - The response object with the status, user data, and generated tokens.
 */
const loginUser = async (req, res) => {
  try {
    // Validate the login data using the loginSchema.
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false, // Collect all validation errors.
    });

    // If validation fails, return 400 status with error messages.
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({ error: errorMessages });
    }

    // Destructure the validated values.
    const { email, password } = _.pick(value, ["email", "password"]);

    // Check if the user with the provided email exists in the database.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify if the provided password matches the stored password hash.
    const isPasswordCorrect = await verifyPassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate an access token and a refresh token for the user.
    const accessToken = generateAccessToken({
      userId: user._id,
      userRole: user.role,
    });
    const refreshToken = generateRefreshToken(
      { userId: user._id },
      user.tokenVersion
    );

    // Return the user data along with the generated tokens.
    res.status(200).json({
      lastName: user.lastName,
      email: user.email,
      accessToken,
      refreshToken,
      profilePic: user.profilePicture,
    });
  } catch (error) {
    // Log any unexpected errors and return a 500 status.
    console.error("An error occurred: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const findUser = async (req, res)=>{
  const {id} = req.params

  const user = User.findById(id).select('firstName lastName email profilePicture')
  if (!user){
    return res.status(404).json({message: "User not found"})
  }

  res.status(200).json({user})
}

const findUsers = async (req, res)=>{
  const user = User.find().select('firstName lastName email profilePicture')
}

export { registerUser, loginUser, findUser, findUsers };
