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
    profilePicture: {
      type: String,
      default: "https://www.gravatar.com/avatar/?d=mp",
    },
    tokenVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    joinedChallenges: [
      {
        type: Schema.Types.ObjectId,
        ref: "Challenge",
      },
    ],
  },
  { timestamps: true, collection: "users" }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ lastName: 1 });

const User = model("User", userSchema);

export default User;
