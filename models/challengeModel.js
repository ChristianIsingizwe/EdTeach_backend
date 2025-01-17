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
        message: "Deadline must be in the future. ",
      },
    },
    duration: {
      type: Number,
      required: true,
    },
    moneyPrize: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
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
  { timestamps: true, collection: "challenges" }
);

challengeSchema.index({ title: 1 });
challengeSchema.index({ deadline: 1 });
challengeSchema.index({ moneyPrize: 1 });

const Challenge = model("Challenge", challengeSchema);

export default Challenge;
