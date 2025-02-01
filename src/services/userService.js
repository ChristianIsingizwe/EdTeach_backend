import _ from "lodash";
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
  const { firstName, lastName, email, password, role } = _.pick(userData, [
    "firstName",
    "lastName",
    "email",
    "password",
    "role",
  ]);

  const userAlreadyExist = await User.findOne({ email });
  if (userAlreadyExist) {
    return { status: 400, data: { message: "User already exists." } };
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    firstName,
    lastName,
    email,
    passwordHash: hashedPassword,
    role,
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  newUser.otp = otp;
  newUser.otpExpiration = Date.now() + 5 * 60 * 1000; // 5-minute expiration for the otp.

  await sendOTP(email, otp);

  await newUser.save();

  return {
    status: 201,
    data: { message: "User registered successfully. Please check your email." },
  };
};

const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    return {
      status: 404,
      data: { message: "User not found." },
    };
  }

  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return {
      status: 400,
      data: { message: "Invalid credentials." },
    };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiration = Date.now() + 5 * 60 * 1000;
  await user.save();
  await sendOTP(user.email, otp);

  return { email: user.email, message: "Verify your email for the OTP" };
};

const verifyOTPService = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { status: 404, data: { message: "User not found." } };
  }

  if (!user.otp || user.otp !== otp || Date.now() > user.otpExpiration) {
    return { status: 400, data: { message: "Invalid or expired OTP." } };
  }

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

  return {
    status: 200,
    data: {
      accessToken,
      refreshToken,
      user,
    },
    cookies: {
      refreshToken,
      options: { httpOnly: true, secure: true, sameSite: "Strict" }, // Add cookie details
    },
  };
};

const findUserService = async (id) => {
  const user = await User.findById(id).select(
    "firstName lastName email profilePictureUrl"
  );
  if (!user) {
    return {
      status: 404,
      data: { message: "User not found" },
    };
  }
  return {
    status: 200,
    data: { user: user },
  };
};

const findUsersService = async () => {
  try {
    const users = await User.find().select(
      "firstName lastName email profilePictureUrl"
    );
    return {
      status: 200,
      data: users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      status: 500,
      data: { message: "Internal server error" },
    };
  }
};

const deleteUserService = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    return {
      status: 404,
      data: { message: "User not found." },
    };
  }
  await User.findByIdAndDelete(id);
  return {
    status: 200,
    data: { message: "User deleted successfully" },
  };
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
      if (err) {
        return reject({ status: 400, data: { error: "Invalid form data." } });
      }

      try {
        const user = await User.findById(id);
        if (!user) {
          return reject({ status: 404, data: { error: "User not found." } });
        }

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
        resolve({
          status: 200,
          data: { message: "User updated successfully.", user },
        });
      } catch (error) {
        reject({
          status: 500,
          data: { error: "An error occurred while updating the profile." },
        });
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
