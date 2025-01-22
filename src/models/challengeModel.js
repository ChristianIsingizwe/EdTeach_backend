import { Schema, model } from "mongoose";

const challengeSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Deadline must be in the future.",
      },
    },

    duration: {
      type: String,
      required: true,
    },

    moneyPrize: {
      type: String,
      required: true,
      min: 0,
    },

    challengeStatus: {
      type: String,
      enum: ["open", "ongoing", "completed"],
      default: "open",
      required: true,
    },

    contactEmail: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },

    projectBrief: {
      type: String,
      required: true,
      trim: true,
    },

    projectTasks: {
      type: [String],
      required: true,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,

    collection: "challenges",
  }
);

const Challenge = model("Challenge", challengeSchema);

export default Challenge;
