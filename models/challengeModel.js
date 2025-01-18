import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Challenge
 * @property {string} title - The title of the challenge.
 * @property {Date} deadline - The deadline for the challenge; must be in the future.
 * @property {number} duration - The duration of the challenge in days.
 * @property {number} moneyPrize - The monetary prize for the challenge, must be non-negative.
 * @property {string} status - The status of the challenge. Can be "open", "ongoing", or "completed".
 * @property {string} contactEmail - The contact email for inquiries about the challenge.
 * @property {string} projectDescription - A detailed description of the project.
 * @property {string} projectBrief - A brief overview of the project.
 * @property {string[]} projectTasks - A list of tasks required for the project.
 * @property {ObjectId[]} participants - References to users participating in the challenge.
 * @property {Date} createdAt - The timestamp for when the document was created.
 * @property {Date} updatedAt - The timestamp for when the document was last updated.
 */

/**
 * Schema representing a challenge on the platform.
 * A challenge is a competition or task that participants can join and complete within a specified deadline.
 */
const challengeSchema = new Schema(
  {
    /**
     * The title of the challenge.
     * - Required field.
     * - Trimmed to remove extra spaces.
     */
    title: {
      type: String,
      trim: true,
      required: true,
    },
    /**
     * The deadline for the challenge.
     * - Required field.
     * - Must be a date in the future.
     */
    deadline: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Deadline must be in the future.",
      },
    },
    /**
     * The duration of the challenge in days.
     * - Required field.
     */
    duration: {
      type: Number,
      required: true,
    },
    /**
     * The monetary prize for completing the challenge.
     * - Required field.
     * - Must be a non-negative value.
     */
    moneyPrize: {
      type: Number,
      required: true,
      min: 0,
    },
    /**
     * The status of the challenge.
     * - Can be "open", "ongoing", or "completed".
     * - Defaults to "open".
     * - Required field.
     */
    challengeStatus: {
      type: String,
      enum: ["open", "ongoing", "completed"],
      default: "open",
      required: true,
    },
    /**
     * Contact email for inquiries about the challenge.
     * - Required field.
     * - Must match a valid email format.
     */
    contactEmail: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    /**
     * A detailed description of the project.
     * - Required field.
     * - Trimmed to remove extra spaces.
     */
    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },
    /**
     * A brief overview of the project.
     * - Required field.
     * - Trimmed to remove extra spaces.
     */
    projectBrief: {
      type: String,
      required: true,
      trim: true,
    },
    /**
     * A list of tasks required for the project.
     * - Required field.
     */
    projectTasks: {
      type: [String],
      required: true,
    },
    /**
     * A list of participants who joined the challenge.
     * - References the "User" collection.
     */
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    /**
     * Automatically includes `createdAt` and `updatedAt` timestamps for each document.
     */
    timestamps: true,
    /**
     * Specifies the name of the collection in the database.
     * Defaults to "challenges" to align with the intended functionality.
     */
    collection: "challenges",
  }
);

/**
 * Indexes to improve query performance.
 * - `title`: Useful for searching challenges by title.
 * - `deadline`: Optimized for sorting or querying challenges by their deadlines.
 * - `moneyPrize`: Optimized for filtering challenges based on prize amounts.
 */
challengeSchema.index({ title: 1 });
challengeSchema.index({ deadline: 1 });
challengeSchema.index({ moneyPrize: 1 });

/**
 * The Challenge model is used to store and manage challenges on the platform.
 *
 * ## Key Features:
 * - Allows creation of challenges with detailed information and rules.
 * - Enables tracking of participants and their progress.
 * - Supports efficient queries using indexes on key fields like title, deadline, and moneyPrize.
 *
 * ## Usage:
 * - Use this model to create, read, update, or delete challenges on the platform.
 * - Query challenges by status, deadline, or prize to show users relevant options.
 */
const Challenge = model("Challenge", challengeSchema);

export default Challenge;
