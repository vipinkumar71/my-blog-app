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

// Helper function to delete associated posts
async function deleteUserPosts(userId) {
  if (!userId) {
    console.warn("No user ID provided for post cleanup");
    return;
  }

  try {
    // Get the Post model dynamically to avoid circular dependencies
    const Post = mongoose.model("Post");
    // Delete all posts by this user
    const result = await Post.deleteMany({ authorId: userId });
    console.log(`Deleted ${result.deletedCount} posts for user: ${userId}`);
    return result.deletedCount;
  } catch (error) {
    console.error(`Error deleting posts for user ${userId}:`, error);
  }
}

// Add a pre-remove hook for document middleware
UserSchema.pre("remove", async function () {
  console.log(`Pre-remove hook triggered for user: ${this._id}`);
  await deleteUserPosts(this._id);
});

// Add a pre-deleteOne hook for query middleware
UserSchema.pre(
  "deleteOne",
  { document: false, query: true },
  async function () {
    const user = await this.model.findOne(this.getFilter());
    if (user) {
      console.log(`Pre-deleteOne hook triggered for user: ${user._id}`);
      await deleteUserPosts(user._id);
    } else {
      console.warn(
        "Pre-deleteOne hook: No user found with the provided filter"
      );
    }
  }
);

// Handle findOneAndDelete
UserSchema.pre("findOneAndDelete", async function () {
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    console.log(`Pre-findOneAndDelete hook triggered for user: ${user._id}`);
    await deleteUserPosts(user._id);
  } else {
    console.warn(
      "Pre-findOneAndDelete hook: No user found with the provided filter"
    );
  }
});

// Handle deleteMany
UserSchema.pre("deleteMany", async function () {
  console.log("Pre-deleteMany hook triggered");
  const users = await this.model.find(this.getFilter(), "_id");
  console.log(`Found ${users.length} users to delete`);

  for (const user of users) {
    await deleteUserPosts(user._id);
  }
});

// Prevent model overwrite error when hot-reloading in development
export default mongoose.models.User || mongoose.model("User", UserSchema);
