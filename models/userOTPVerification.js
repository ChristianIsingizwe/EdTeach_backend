import { Schema, model } from "mongoose";

const verificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    code: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300,
    },
  },
  { collection: "verifications" }
);

const Verification = model("Verification", verificationSchema);

export default Verification;
