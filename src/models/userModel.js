import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },

    profilePictureUrl: {
      type: String,
      default: "https://www.gravatar.com/avatar/?d=mp",
    },

    tokenVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiration: {
      type: Date,
      default: null,
    },

    joinedChallenges: [
      {
        type: Schema.Types.ObjectId,
        ref: "Challenge",
      },
    ],
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = model("User", userSchema);

export default User;
