import { randomInt } from "crypto"; // Importing randomInt from 'crypto' module to generate secure random numbers.
import { hash, compare } from "bcrypt"; // Importing 'hash' and 'compare' functions from 'bcrypt' for password and code hashing.

/**
 * Generates a random 6-digit verification code.
 *
 * Uses Node's built-in 'crypto' module to generate a secure random number between 100000 and 999999.
 * This random number is then converted to a string, making it suitable for use in verification processes.
 *
 * @returns {string} A 6-digit verification code as a string.
 *
 * @example
 * const code = generateVerificationCode();
 * console.log(code); // Outputs a random 6-digit code like "123456"
 */
const generateVerificationCode = () => {
  // Generates a secure 6-digit random integer.
  return randomInt(100000, 999999).toString();
};

/**
 * Hashes the given verification code using bcrypt.
 *
 * Hashing is done to store verification codes securely and to avoid plain-text storage.
 * bcrypt's cost factor of 10 is used to generate the hash, ensuring a good balance between security and performance.
 *
 * @param {string} code - The verification code to be hashed.
 *
 * @returns {Promise<string>} A promise that resolves to the hashed code.
 *
 * @example
 * const hashedCode = await hashCode("123456");
 * console.log(hashedCode); // Outputs the hashed verification code.
 */
const hashCode = async (code) => {
  // Hashes the verification code with a salt round of 10.
  return await hash(code, 10);
};

/**
 * Verifies if the provided code matches the hashed code.
 *
 * Uses bcrypt's 'compare' function to check if the plain-text code matches the previously hashed code.
 * This function is used to verify the user's input against the stored hash.
 *
 * @param {string} code - The plain-text verification code entered by the user.
 * @param {string} hashedCode - The previously hashed verification code stored in the system.
 *
 * @returns {Promise<boolean>} Resolves to a boolean indicating whether the code is valid (true) or not (false).
 *
 * @example
 * const isValid = await verifyCode("123456", hashedCode);
 * console.log(isValid); // Outputs true if the codes match, otherwise false.
 */
const verifyCode = async (code, hashedCode) => {
  // Compares the provided plain-text code with the stored hashed code.
  return compare(code, hashedCode);
};

// Exporting the functions for use in other parts of the application.
export { generateVerificationCode, hashCode, verifyCode };
