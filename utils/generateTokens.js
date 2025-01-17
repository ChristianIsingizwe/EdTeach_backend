import jwt from "jsonwebtoken";

/**
 * Generates an access token with a given payload.
 * The access token is used for authenticating users for a limited period (20 minutes in this case).
 *
 * The access token is signed with a secret key defined in the environment variable `ACCESS_TOKEN_SECRET_KEY`.
 *
 * @param {Object} payload - The data to include in the access token (e.g., user id, roles).
 * @returns {string} The signed JWT access token.
 *
 * @throws {Error} Throws an error if token generation fails (e.g., invalid secret key).
 *
 * @example
 * const accessToken = generateAccessToken({ userId: 123 });
 * console.log(accessToken); // Outputs the generated JWT token.
 */
const generateAccessToken = (payload) => {
  try {
    // Signs and generates the access token with the provided payload.
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: "20min", // The access token expires in 20 minutes.
    });
  } catch (error) {
    // Log the error and throw a new one to ensure proper error handling.
    console.error(
      "An error happened while generating the access token: ",
      error
    );
    throw new Error("Failed to generate access token.");
  }
};

/**
 * Generates a refresh token with a given payload and token version.
 * The refresh token is used to obtain a new access token when the current one expires.
 *
 * The refresh token is signed with a secret key defined in the environment variable `REFRESH_TOKEN_SECRET_KEY`.
 *
 * @param {Object} payload - The data to include in the refresh token (e.g., user id).
 * @param {number} tokenVersion - A version number to track refresh token invalidation.
 * @returns {string} The signed JWT refresh token.
 *
 * @throws {Error} Throws an error if token generation fails.
 *
 * @example
 * const refreshToken = generateRefreshToken({ userId: 123 }, 1);
 * console.log(refreshToken); // Outputs the generated JWT refresh token.
 */
const generateRefreshToken = (payload, tokenVersion) => {
  try {
    // Combine the payload with the token version.
    const refreshPayload = { ...payload, tokenVersion };

    // Signs and generates the refresh token with the combined payload.
    return jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: "20d", // The refresh token expires in 20 days.
    });
  } catch (error) {
    // Log the error and throw a new one to ensure proper error handling.
    console.error(
      "An error happened while generating the refresh token: ",
      error
    );
    throw new Error("Failed to generate refresh token");
  }
};

// Export the functions for use in other parts of the application.
export { generateAccessToken, generateRefreshToken };
