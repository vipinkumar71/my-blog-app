import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: String,
  provider: String,
  providerAccountId: String,
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
});

// Compound index for provider + providerAccountId
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

// Prevent model overwrite error when hot-reloading in development
export default mongoose.models.Account ||
  mongoose.model("Account", AccountSchema);
