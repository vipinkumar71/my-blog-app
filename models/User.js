import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    emailVerified: Date,
    image: String,
    password: String, // For JWT auth (hashed)
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error when hot-reloading in development
export default mongoose.models.User || mongoose.model("User", UserSchema);
