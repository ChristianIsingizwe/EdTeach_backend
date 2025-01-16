import { randomInt } from "crypto";
import { hash, compare } from "bcrypt";

/**
 * Generates a 6-digit numeric code.
 * @returns {string} A 6-digit numeric code.
 */
const generateVerificationCode = () => {
  return randomInt(100000, 999999).toString();
};
/**
 * Hashes a verification code using bcrypt.
 * @param {string} code - The plain-text code to hash.
 * @returns {Promise<string>} The hashed code.
 */

const hashCode = async (code) => {
  return await hash(code, 10);
};

/**
 * Verifies a plain-text code against a hashed code.
 * @param {string} code - The plain-text code.
 * @param {string} hashedCode - The hashed code to compare with.
 * @returns {Promise<boolean>} True if the codes match, otherwise false.
 */

const verifyCode = async (code, hashedCode) => {
  return compare(code, hashedCode);
};

export { generateVerificationCode, hashCode, verifyCode };
