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
import path from "path";
import { validateFile } from "../utils/imageHelpers.js";
import fs from "fs";
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
    console.error("An error occurred: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const findUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select(
    "firstName lastName email profilePicture"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
};

const findUsers = async (req, res) => {
  const users = await User.find().select(
    "firstName lastName email profilePicture"
  );
  res.status(200).json({ users });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Internal server error. " });
    }
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  const form = formidable({
    multiples: false, // Single file upload
    maxFileSize: 5 * 1024 * 1024, // 5 MB size limit
    filter: ({ mimetype }) => {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/tiff",
        "image/bmp",
        "image/gif",
        "image/svg+xml",
      ];
      return allowedMimeTypes.includes(mimetype);
    },
    uploadDir: path.join(__dirname, "../uploads"), // Temporary storage directory
    keepExtensions: true, // Preserve file extensions
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(400).json({ error: "Invalid form data." });
    }

    try {
      // Validate JSON fields
      const { error } = updateUserSchema.validate(fields);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      // Update password if provided
      if (fields.currentPassword && fields.newPassword) {
        const isMatch = await verifyPassword(
          fields.currentPassword,
          user.passwordHash
        );
        if (!isMatch) {
          return res
            .status(400)
            .json({ error: "Current password is incorrect." });
        }
        user.password = hashPassword(fields.newPassword);
      }

      // Update other fields
      if (fields.firstName) user.firstName = fields.firstName;
      if (fields.lastName) user.lastName = fields.lastName;

      // Handle profile picture if provided
      if (files.profilePicture) {
        const file = files.profilePicture;

        // Validate file
        validateFile(file, 5 * 1024 * 1024, [
          "image/jpeg",
          "image/png",
          "image/tiff",
          "image/bmp",
          "image/gif",
          "image/svg+xml",
        ]);

        const outputDir = path.join(__dirname, "../public/profile-pictures");
        fs.mkdir(outputDir, { recursive: true });

        if (
          !["image/svg+xml", "image/gif", "image/bmp"].includes(file.mimetype)
        ) {
          // Resize and save image
          const resizedImagePath = await resizeImage(
            file.filepath,
            path.join(outputDir, `user-${user._id}-${Date.now()}.jpeg`),
            300
          );
          user.profilePictureUrl = `/profile-pictures/${path.basename(
            resizedImagePath
          )}`;
        } else {
          // Move file as is for non-resizable formats
          const outputPath = path.join(
            outputDir,
            `user-${user._id}-${Date.now()}-${file.originalFilename}`
          );
          fs.rename(file.filepath, outputPath);
          user.profilePictureUrl = `/profile-pictures/${path.basename(
            outputPath
          )}`;
        }
      }

      await user.save();

      res.status(200).json({
        message: "User updated successfully.",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePictureUrl,
        },
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the profile." });
    }
  });
};

export { registerUser, loginUser, findUser, findUsers, updateUser, deleteUser };
