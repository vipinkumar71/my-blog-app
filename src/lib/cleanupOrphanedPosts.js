import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";

/**
 * Cleans up orphaned posts by identifying and deleting posts
 * whose authorId no longer corresponds to an existing user.
 *
 * @returns {Promise<{deleted: number, total: number}>} Number of deleted posts and total posts
 */
export async function cleanupOrphanedPosts() {
  try {
    // Ensure DB connection
    await dbConnect();

    console.log("Starting orphaned posts cleanup process...");

    // Find all posts
    const allPosts = await Post.find({}).lean();
    console.log(`Found ${allPosts.length} total posts`);

    let deletedCount = 0;

    // For each post, check if author exists
    for (const post of allPosts) {
      if (!post.authorId) {
        console.log(`Post ${post._id} has no author ID, marking for deletion`);
        await Post.deleteOne({ _id: post._id });
        deletedCount++;
        continue;
      }

      // Check if user exists
      const authorExists = await User.findById(post.authorId).lean();

      if (!authorExists) {
        console.log(
          `Post ${post._id} has non-existent author ${post.authorId}, deleting`
        );
        await Post.deleteOne({ _id: post._id });
        deletedCount++;
      }
    }

    console.log(`Cleanup complete. Deleted ${deletedCount} orphaned posts.`);
    return { deleted: deletedCount, total: allPosts.length };
  } catch (error) {
    console.error("Error cleaning up orphaned posts:", error);
    throw error;
  }
}

/**
 * More efficient cleanup method for large databases
 * Instead of checking each post, it identifies existing users and bulk-deletes posts
 * whose authors are not in the list
 *
 * @returns {Promise<{deleted: number}>} Number of deleted posts
 */
export async function bulkCleanupOrphanedPosts() {
  try {
    // Ensure DB connection
    await dbConnect();

    console.log("Starting bulk orphaned posts cleanup process...");

    // Get all user IDs
    const users = await User.find({}, "_id").lean();
    const validUserIds = users.map((user) => user._id);

    console.log(`Found ${validUserIds.length} valid users`);

    // Delete all posts where authorId is not in validUserIds
    const deleteResult = await Post.deleteMany({
      authorId: { $nin: validUserIds },
    });

    console.log(
      `Bulk cleanup complete. Deleted ${deleteResult.deletedCount} orphaned posts.`
    );
    return { deleted: deleteResult.deletedCount };
  } catch (error) {
    console.error("Error in bulk cleanup of orphaned posts:", error);
    throw error;
  }
}
