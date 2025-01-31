import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils";

jest.mock("jsonwebtoken");

describe("Token Utility Functions", () => {
  const mockPayload = { id: "12345", email: "test@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate an access token", () => {
    jwt.sign.mockReturnValue("mockAccessToken");

    const token = generateAccessToken(mockPayload);
    expect(token).toBe("mockAccessToken");
    expect(jwt.sign).toHaveBeenCalledWith(
      mockPayload,
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: "20min",
      }
    );
  });

  it("should generate a refresh token", () => {
    jwt.sign.mockReturnValue("mockRefreshToken");

    const token = generateRefreshToken(mockPayload, 1);
    expect(token).toBe("mockRefreshToken");
    expect(jwt.sign).toHaveBeenCalledWith(
      { ...mockPayload, tokenVersion: 1 },
      process.env.REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: "20d" }
    );
  });

  it("should throw an error if access token generation fails", () => {
    jwt.sign.mockImplementation(() => {
      throw new Error("Token error");
    });

    expect(() => generateAccessToken(mockPayload)).toThrow(
      "Failed to generate access token."
    );
  });

  it("should throw an error if refresh token generation fails", () => {
    jwt.sign.mockImplementation(() => {
      throw new Error("Token error");
    });

    expect(() => generateRefreshToken(mockPayload, 1)).toThrow(
      "Failed to generate refresh token"
    );
  });
});
