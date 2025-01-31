import { hashPassword, verifyPassword } from "../utils/passwordUtils";

describe("Password Utility Functions", () => {
  it("should hash a password correctly", async () => {
    const plainPassword = "securepassword123";
    const hashedPassword = await hashPassword(plainPassword);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(plainPassword);
  });

  it("should verify a correct password", async () => {
    const plainPassword = "securepassword123";
    const hashedPassword = await hashPassword(plainPassword);

    const isMatch = await verifyPassword(plainPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const plainPassword = "securepassword123";
    const hashedPassword = await hashPassword(plainPassword);

    const isMatch = await verifyPassword("wrongpassword", hashedPassword);
    expect(isMatch).toBe(false);
  });

  it("should throw an error if hashing fails", async () => {
    jest.spyOn(require("bcrypt"), "hash").mockImplementation(() => {
      throw new Error("Hashing error");
    });

    await expect(hashPassword("password")).rejects.toThrow(
      "Failed to hash password."
    );
  });

  it("should throw an error if verification fails", async () => {
    jest.spyOn(require("bcrypt"), "compare").mockImplementation(() => {
      throw new Error("Comparison error");
    });

    await expect(verifyPassword("password", "hash")).rejects.toThrow(
      "Failed to verify password:"
    );
  });
});
