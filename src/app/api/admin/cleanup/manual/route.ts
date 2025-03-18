import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";

/**
 * Simple endpoint to clean up orphaned posts
 * This can be called from a browser or API client
 * In production, you should add auth protection
 */
export async function GET() {
  try {
    // In production, you'd add authentication here

    // Connect to the database
    await dbConnect();

    // Get all valid user IDs
    const users = await User.find({}, "_id").lean();
    const validUserIds = users.map((user) => user._id);

    console.log(`Found ${validUserIds.length} valid users`);

    // Find and count posts with invalid authorIds
    const orphanedPostsCount = await Post.countDocuments({
      authorId: { $nin: validUserIds },
    });

    // Delete all posts where authorId is not in validUserIds
    const deleteResult = await Post.deleteMany({
      authorId: { $nin: validUserIds },
    });

    console.log(`Deleted ${deleteResult.deletedCount} orphaned posts`);

    return NextResponse.json({
      message: "Cleanup completed successfully",
      totalUsers: validUserIds.length,
      orphanedPostsFound: orphanedPostsCount,
      postsDeleted: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error cleaning up orphaned posts:", error);
    return NextResponse.json(
      { message: "Error cleaning up orphaned posts", error: error.message },
      { status: 500 }
    );
  }
}
