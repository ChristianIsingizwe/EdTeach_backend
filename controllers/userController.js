import User from "../models/userModel.js"; // Importing User model to interact with the database.
import {
  registerUserSchema,
  loginSchema,
  updateUserSchema,
} from "../joiSchemas/userSchemas.js";
import { hashPassword, verifyPassword } from "../utils/passwordHelper.js"; // Importing utility functions to hash and verify passwords.
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js"; // Importing functions for token generation.
import _ from "lodash"; // Importing lodash to simplify object manipulation.
import formidable from "formidable";
import { statSync } from "fs";
import processImage from "../utils/processImages.js";
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

    // Return the refresh token inside a cookie.
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });

    // Return the user data along with the generated tokens.
    res.status(201).json({ firstName, lastName, email, accessToken });
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

    // Return the refresh token inside a cookie.
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });

    // Return the user data along with the generated tokens.
    res.status(200).json({
      lastName: user.lastName,
      email: user.email,
      accessToken,
    });
  } catch (error) {
    // Log any unexpected errors and return a 500 status.
    console.error("An error occurred: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const findUser = async (req, res) => {
  const { id } = req.params;

  const user = User.findById(id).select(
    "firstName lastName email profilePicture"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
};

const findUsers = async (req, res) => {
  const users = User.find().select("firstName lastName email profilePicture");
  res.statuts(200).json({ users });
};

const updateUser = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Error parsing data: ", err });
    }

    try {
      await updateUserSchema.validateAsync(fields);
    } catch (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { firstName, lastName, currentPassword, newPassword } = fields;
    let hashedPassword;

    if (currentPassword && newPassword) {
      try {
        const user = User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const isMatch = verifyPassword(currentPassword, user.passwordHash);
        if (!isMatch) {
          return res.status(400).json({ message: "Password incorrect" });
        }
        hashedPassword = await hashPassword(newPassword);
      } catch (error) {
        return res.status(500).json({ message: "Error updating passwords. " });
      }

      let profilePicturePath = files.profilePicture
        ? files.profilePicture.path
        : null;
      if (profilePicturePath) {
        const fileSize = statSync(profilePicturePath).size;
        const maxFileSize = 5 * 1024 * 1024;

        if (fileSize > maxFileSize) {
          return res
            .status(400)
            .json({ error: "File too large. Max size is 5MB" });
        }
        try {
          profilePicturePath = await processImage(profilePicturePath);
        } catch (error) {
          return res.status(500).json({ error: "Error processing the Image" });
        }
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          req.user.id,
          {
            firstName,
            lastName,
            password: hashedPassword,
            profilePicture: profilePicturePath,
          },
          { new: true }
        );
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }
        res
          .status(200)
          .json({ message: "User updated successfully", updatedUser });
      } catch (error) {
        res.status(500).json({ message: "Error updating the user status" });
      }
    }
  });
};

export { registerUser, loginUser, findUser, findUsers, updateUser };
