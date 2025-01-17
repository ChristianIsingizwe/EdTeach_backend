import Joi from "joi";
import User from "../models/userModel";
import { hashPassword, verifyPassword } from "../../utils/passwordHelper";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateTokens";
import _ from "lodash";

const registerUserSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .required(),
  lastName: Joi.string()
    .min(2)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .required(),
  role: Joi.string().required().default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&/])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .required(),
});

const registerUser = async (req, res) => {
  try {
    const { error, value } = registerUserSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({ error: errorMessages });
    }

    const { firstName, lastName, email, password, role } = _.pick(value, [
      "firstName",
      "lastName",
      "email",
      "password",
      "role",
    ]);

    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res.status(400).json({ message: "User already exist." });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role,
    });
    const accessToken = generateAccessToken({
      userId: newUser._id,
      userRole: newUser.role,
    });
    const refreshToken = generateRefreshToken(
      { userId: newUser._id },
      newUser.tokenVersion
    );
    res
      .status(201)
      .json({ firstName, lastName, email, accessToken, refreshToken });
  } catch (error) {
    console.error("An error occurred while registering the user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({ error: errorMessages });
    }

    const { email, password } = _.pick(value, ['email', 'password']);

    const user = User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken({
      userId: user._id,
      userRole: user.role,
    });
    const refreshToken = generateRefreshToken(
      { userId: user._id },
      user.tokenVersion
    );
    res.status(200).json({
      lastName: user.lastName,
      email: user.email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("An error occurred: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { registerUser, loginUser };
