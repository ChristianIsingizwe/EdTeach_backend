import _ from "lodash";
import formidable from "formidable";
import path from "path";
import { randomBytes } from "crypto";
import cloudinary from "cloudinary";

import User from "../models/userModel";
import {
  registerUserSchema,
  loginSchema,
  updateUserFieldsSchema,
} from "../joiSchemas/userSchemas";
import { hashPassword, verifyPassword } from "../utils/passwordHelper";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";
import { sendOTP } from "../utils/sendOtp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role,
    });

    try {
      const otp = randomBytes(3).toString("hex");
      newUser.otp = otp;
      newUser.otpExpiration = Date.now() + 5 * 60 * 1000;

      await sendOTP(email, otp);
    } catch (otpError) {
      console.error("Error sending OTP: ", otpError);

      return res.status(500).json({
        message: "Failed to send OTP. Registration could not be completed.",
      });
    }
 
    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully. Please check your email.",
    });
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

    const { email, password } = _.pick(value, ["email", "password"]);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await verifyPassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = randomBytes(3).toString("hex");
    user.otp = otp;
    user.otpExpiration = Date.now() + 5 * 60 * 1000;

    await user.save();
    await sendOTP(user.email, otp);

    res.status(200).json({
      email: user.email,
      message: "Verify your email for the OTP",
    });
  } catch (error) {
    console.error("An error occurred: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = _.pick(req.body, ["email", "otp"]);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.otp || user.otp !== otp || Date.now() > user.otpExpiration) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
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
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accessToken,
    });


  } catch (error) {
    console.error("Error verifying OTP: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select(
    "firstName lastName email profilePictureUrl"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
};

const findUsers = async (req, res) => {
  const users = await User.find().select(
    "firstName lastName email profilePictureUrl"
  );
  res.status(200).json({ users });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Internal server error. " });
    }
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("An error occurred: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  const form = formidable({
    multiples: false,
    maxFileSize: 1 * 1024 * 1024,
    filter: ({ mimetype }) => {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/tiff",
        "image/bmp",
        "image/gif",
        "image/svg+xml",
      ];
      return allowedMimeTypes.includes(mimetype);
    },
    uploadDir: path.join(__dirname, "../uploads"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(400).json({ error: "Invalid form data." });
    }

    try {
      const { error } = updateUserFieldsSchema.validate(fields);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (fields.currentPassword && fields.newPassword) {
        const isMatch = await verifyPassword(
          fields.currentPassword,
          user.passwordHash
        );
        if (!isMatch) {
          return res
            .status(400)
            .json({ error: "Current password is incorrect." });
        }
        user.password = hashPassword(fields.newPassword);
      }

      if (fields.firstName) user.firstName = fields.firstName;
      if (fields.lastName) user.lastName = fields.lastName;

      if (files.profilePicture) {
        const file = files.profilePicture;

        const cloudinaryResponse = await cloudinary.uploader.upload(
          file.filepath,
          {
            folder: "profile_pictures",
            public_id: `user-${user._id}-${Date.now()}`,
            resource_type: "image",
            transformation: [{ width: 300, height: 300, crop: "limit" }],
          }
        );

        user.profilePictureUrl = cloudinaryResponse.secure_url;
      }

      await user.save();

      res.status(200).json({
        message: "User updated successfully.",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePictureUrl,
        },
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({
        error: "An error occurred while updating the profile.",
      });
    }
  });
};
export {
  registerUser,
  loginUser,
  findUser,
  findUsers,
  updateUser,
  deleteUser,
  verifyOTP,
};
