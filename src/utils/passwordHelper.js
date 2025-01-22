import { compare, genSalt, hash } from "bcrypt";

const hashPassword = async (plainPassword) => {
  try {
    const salt = await genSalt(10);
    const hashedPassword = await hash(plainPassword, salt);
    return hashedPassword;
  } catch (error) {
    console.error("An error happened while encrypting the password: ", error);
    throw new Error("Failed to hash password.");
  }
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("An error occurred: ", error);
    throw new Error("Failed to verify password:");
  }
};

export { hashPassword, verifyPassword };
