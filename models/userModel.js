import { Schema, model } from "mongoose";

/**
 * @typedef {Object} User
 * @property {string} firstName - The user's first name, required and between 3-255 characters.
 * @property {string} lastName - The user's last name, required and between 3-255 characters.
 * @property {string} email - The user's email address, must be unique and match a valid email format.
 * @property {string} passwordHash - The hashed password of the user, required for authentication.
 * @property {string} role - The role of the user, either "user" or "admin".
 * @property {string} profilePicture - The URL of the user's profile picture. Defaults to a Gravatar image.
 * @property {number} tokenVersion - A version number for tracking token invalidation during authentication.
 * @property {ObjectId[]} joinedChallenges - References to challenges the user has joined.
 * @property {Date} createdAt - Timestamp when the user document was created.
 * @property {Date} updatedAt - Timestamp when the user document was last updated.
 */

const userSchema = new Schema(
  {
    /**
     * The user's first name.
     * - Must be between 3 and 255 characters.
     * - Leading/trailing whitespace is trimmed.
     * - Required field.
     */
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    /**
     * The user's last name.
     * - Must be between 3 and 255 characters.
     * - Leading/trailing whitespace is trimmed.
     * - Required field.
     */
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    /**
     * The user's email address.
     * - Must be unique.
     * - Validated with a regex pattern for email format.
     * - Required field.
     */
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Matches standard email format
    },
    /**
     * The hashed password of the user.
     * - Required field.
     */
    passwordHash: {
      type: String,
      required: true,
    },
    /**
     * The user's role in the system.
     * - Can be either "user" or "admin".
     * - Required field.
     */
    role: {
      type: String,
      enum: ["user", "admin"], // Only these two values are allowed
      required: true,
    },
    /**
     * URL of the user's profile picture.
     * - Defaults to a Gravatar image with a placeholder.
     */
    profilePictureUrl: {
      type: String,
      default: "https://www.gravatar.com/avatar/?d=mp", // Default avatar from Gravatar
    },
    /**
     * A version number used for invalidating tokens (e.g., during password resets).
     * - Default is 1.
     * - Required field.
     */
    tokenVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    /**
     * This is a field for checking if the user has been verified by entered the code he has been given on his email.
     * - Default is false 
     * - The field is required
     */
    isVerified: {
      type: Boolean, 
      required: true, 
      default: false
    },
    /**
     * References to the challenges the user has joined.
     * - Array of ObjectIds referencing the "Challenge" collection.
     */
    joinedChallenges: [
      {
        type: Schema.Types.ObjectId,
        ref: "Challenge", // References the Challenge model
      },
    ],
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    collection: "users", // Specifies the collection name in MongoDB
  }
);

/**
 * Index for improving query performance on the `lastName` field.
 * Example: Used in search operations for users by their last name.
 */
userSchema.index({ lastName: 1 }); // Creates an ascending index on `lastName`

// Create and export the User model
const User = model("User", userSchema);

export default User;
