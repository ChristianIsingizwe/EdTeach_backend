import jwt from "jsonwebtoken";
/**
 * Generates an access token
 * @param {object} payload - The data to encode in the token
 * @returns {string} The generated JWT token
 * @throws{Error} If there is an error during access token generation
 */

const generateAccessToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: "20min",
    });
  } catch (error) {
    console.error(
      "An error happened while generating the access token: ",
      error
    );
    throw new Error("Failed to generate access token. ");
  }
};

/**
 *
 * @param {object} payload - The normal data to encode
 * @param {number} tokenVersion The token version for the token
 * @returns {string} The generated jwt token
 * @throws{Error} if there is an error during the token version generation.
 */

const generateRefreshToken = (payload, tokenVersion) => {
  try {
    const refreshPayoad = { ...payload, tokenVersion };
    return jwt.sign(refreshPayoad, process.env.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: "30d",
    });
  } catch (error) {}
  console.error(
    "An error happened while generating the refresh token: ",
    error
  );
  throw new Error("Failed to generate refresh token");
};

export { generateAccessToken, generateRefreshToken };
