import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { bulkCleanupOrphanedPosts } from "@/lib/cleanupOrphanedPosts";

// List of admin emails who can access this endpoint
// In a production app, you'd store this in env vars or the database
const ADMIN_EMAILS = ["admin@example.com"];

/**
 * Admin-only endpoint to clean up orphaned posts (posts with deleted authors)
 */
export async function POST(request: Request) {
  try {
    // Authenticate the request
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized - Must be logged in" },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Extract the cleanup mode from the request (optional)
    const { mode = "bulk" } = await request.json().catch(() => ({}));

    // Perform the cleanup operation
    const result = await bulkCleanupOrphanedPosts();

    return NextResponse.json({
      message: "Cleanup completed successfully",
      deletedPosts: result.deleted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in admin cleanup endpoint:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
