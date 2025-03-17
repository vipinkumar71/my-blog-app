import mongoose from "mongoose";

const VerificationTokenSchema = new mongoose.Schema({
  identifier: String,
  token: {
    type: String,
    unique: true,
  },
  expires: Date,
});

// Compound index for identifier + token
VerificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

// Prevent model overwrite error when hot-reloading in development
export default mongoose.models.VerificationToken ||
  mongoose.model("VerificationToken", VerificationTokenSchema);
