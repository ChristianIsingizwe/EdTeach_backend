import { randomInt } from "crypto";
import { hash, compare } from "bcrypt";

const generateVerificationCode = () => {
  return randomInt(100000, 999999).toString();
};

const hashCode = async (code) => {
  return await hash(code, 10);
};

const verifyCode = async (code, hashedCode) => {
  return compare(code, hashedCode);
};

export { generateVerificationCode, hashCode, verifyCode };
