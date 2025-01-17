import { compare, genSalt, hash } from "bcrypt"; // Importing bcrypt's methods for password hashing and comparison.

/**
 * Hashes a plain-text password using bcrypt.
 *
 * This function generates a salt and hashes the password using bcrypt's `hash` function with a salt rounds of 10.
 * It ensures that the password is stored securely and cannot be retrieved in plain text.
 *
 * @param {string} plainPassword - The plain-text password to be hashed.
 * @returns {Promise<string>} The hashed password.
 *
 * @throws {Error} Throws an error if password hashing fails (e.g., issue with salt generation).
 *
 * @example
 * const hashedPassword = await hashPassword("mySecurePassword123");
 * console.log(hashedPassword); // Outputs the hashed version of the password.
 */
const hashPassword = async (plainPassword) => {
  try {
    // Generate a salt with 10 rounds
    const salt = await genSalt(10);
    // Hash the password using the generated salt
    const hashedPassword = await hash(plainPassword, salt);
    return hashedPassword; // Return the hashed password.
  } catch (error) {
    // Log the error and throw a new error to ensure proper error handling.
    console.error("An error happened while encrypting the password: ", error);
    throw new Error("Failed to hash password.");
  }
};

/**
 * Verifies if the provided plain-text password matches the stored hashed password.
 *
 * This function uses bcrypt's `compare` method to securely compare the provided password with the stored hash.
 *
 * @param {string} plainPassword - The plain-text password entered by the user.
 * @param {string} hashedPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} Resolves to a boolean indicating whether the passwords match (true) or not (false).
 *
 * @throws {Error} Throws an error if password comparison fails (e.g., internal bcrypt issues).
 *
 * @example
 * const isValidPassword = await verifyPassword("mySecurePassword123", hashedPassword);
 * console.log(isValidPassword); // Outputs true if passwords match, otherwise false.
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    // Compare the plain password with the hashed password.
    return compare(plainPassword, hashedPassword);
  } catch (error) {
    // Log the error and throw a new error to ensure proper error handling.
    console.error("An error occurred: ", error);
    throw new Error("Failed to verify password:");
  }
};

// Export the functions for use in other parts of the application.
export { hashPassword, verifyPassword };
