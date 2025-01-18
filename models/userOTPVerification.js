import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Verification
 * @property {ObjectId} userId - Reference to the user associated with the verification code.
 * @property {string} code - The hashed verification code sent to the user's email.
 * @property {Date} createdAt - The timestamp when the verification record was created. Automatically expires after 5 minutes (300 seconds).
 */

/**
 * Schema representing a verification record for multi-factor authentication (MFA).
 * This schema is designed to store hashed verification codes temporarily, associated with a specific user.
 */
const verificationSchema = new Schema(
  {
    /**
     * The ID of the user associated with the verification code.
     * - Required field.
     * - Refers to the "User" collection.
     */
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    /**
     * The hashed verification code sent to the user's email.
     * - Required field.
     */
    code: {
      type: String,
      required: true,
    },
    /**
     * Timestamp indicating when the verification record was created.
     * - Defaults to the current date and time.
     * - Automatically expires after 300 seconds (5 minutes) using MongoDB's TTL (Time-to-Live) index.
     */
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Automatically delete the document after 300 seconds
    },
  },
  {
    /**
     * Specifies the name of the collection in the database.
     * Defaults to "verifications" to align with the intended functionality.
     */
    collection: "verifications",
  }
);

/**
 * The Verification model is used to store and manage user verification codes for processes like
 * email verification or multi-factor authentication (MFA).
 * 
 * ## Key Features:
 * - Associates a unique verification code with a user.
 * - Uses TTL indexing to automatically remove expired codes from the database.
 * - Ensures scalability and security by storing hashed codes only.
 * 
 * ## Usage:
 * - Use this model to create verification records when sending OTPs or email verification codes.
 * - Query this model to validate user-provided codes during verification processes.
 * - Automatically cleans up expired records, improving database performance.
 */
const Verification = model("Verification", verificationSchema);

export default Verification;
