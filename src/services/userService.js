import _ from "lodash";
import { randomBytes } from "crypto";
import cloudinary from "cloudinary";
import formidable from "formidable";
import path from "path";
import User from "../models/userModel";
import { hashPassword, verifyPassword } from "../utils/passwordHelper";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";
import { sendOTP } from "../utils/sendOtp";
import ensureUploadDir from "../utils/ensureFolderExist";

const registerUserService = async (userData) => {
  const { firstName, lastName, email, password, role } = userData;

  const userAlreadyExist = await User.findOne({ email });
  if (userAlreadyExist) throw new Error("User already exists.");

  const hashedPassword = await hashPassword(password);
  const newUser = new User({
    firstName,
    lastName,
    email,
    passwordHash: hashedPassword,
    role,
  });

  const otp = randomBytes(3).toString("hex");
  newUser.otp = otp;
  newUser.otpExpiration = Date.now() + 5 * 60 * 1000;
  await sendOTP(email, otp);

  await newUser.save();
  return "User registered successfully. Please check your email.";
};

const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);
  if (!isPasswordCorrect) throw new Error("Invalid credentials");

  const otp = randomBytes(3).toString("hex");
  user.otp = otp;
  user.otpExpiration = Date.now() + 5 * 60 * 1000;
  await user.save();
  await sendOTP(user.email, otp);

  return { email: user.email, message: "Verify your email for the OTP" };
};

const verifyOTPService = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found.");
  if (!user.otp || user.otp !== otp || Date.now() > user.otpExpiration)
    throw new Error("Invalid or expired OTP.");

  const accessToken = generateAccessToken({
    userId: user._id,
    userRole: user.role,
  });
  const refreshToken = generateRefreshToken(
    { userId: user._id },
    user.tokenVersion
  );

  user.otp = null;
  user.otpExpiration = null;
  await user.save();

  return { accessToken, refreshToken, user };
};

const findUserService = async (id) => {
  const user = await User.findById(id).select(
    "firstName lastName email profilePictureUrl"
  );
  if (!user) throw new Error("User not found");
  return user;
};

const findUsersService = async () => {
  return await User.find().select("firstName lastName email profilePictureUrl");
};

const deleteUserService = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");
  await User.findByIdAndDelete(id);
  return "User deleted successfully";
};

const updateUserService = async (id, req) => {
  const form = formidable({
    multiples: false,
    maxFileSize: 1 * 1024 * 1024,
    filter: ({ mimetype }) => ["image/jpeg", "image/png"].includes(mimetype),
    uploadDir: ensureUploadDir(path.join(__dirname, "../uploads")),
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) return reject("Invalid form data.");

      try {
        const user = await User.findById(id);
        if (!user) return reject("User not found.");

        if (fields.firstName) user.firstName = fields.firstName;
        if (fields.lastName) user.lastName = fields.lastName;

        if (files.profilePicture) {
          const file = files.profilePicture[0];
          const cloudinaryResponse = await cloudinary.uploader.upload(
            file.filepath,
            {
              folder: "profile_pictures",
              public_id: `user-${user._id}-${Date.now()}`,
              resource_type: "image",
            }
          );
          user.profilePictureUrl = cloudinaryResponse.secure_url;
        }

        await user.save();
        resolve({ message: "User updated successfully.", user });
      } catch (error) {
        reject("An error occurred while updating the profile.");
      }
    });
  });
};

export {
  registerUserService,
  loginUserService,
  verifyOTPService,
  findUserService,
  findUsersService,
  deleteUserService,
  updateUserService,
};
