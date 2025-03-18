"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, status } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Fetch user's posts
    if (status === "authenticated" && session?.user?.id) {
      fetchUserPosts();
    }
  }, [status, session, router]);

  const fetchUserPosts = async () => {
    try {
      setIsLoading(true);

      if (!session?.user?.id) {
        console.error("Cannot fetch posts: No user ID available");
        setError(
          "User information not available. Please try logging in again."
        );
        setIsLoading(false);
        return;
      }

      console.log("Fetching posts for user:", session.user.id);

      const response = await fetch("/api/posts");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Safely parse the JSON response with a try-catch
      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error("Failed to parse API response:", error);
        setError("Failed to parse server response. Please try again.");
        setIsLoading(false);
        return;
      }

      // Triple safety check for data validity
      if (!data) {
        console.error("API response was empty");
        setError("No data received from server.");
        setIsLoading(false);
        return;
      }

      // Check if the response is an array
      if (!Array.isArray(data)) {
        console.error("API did not return an array:", data);
        // Try to handle non-array responses by wrapping single objects in an array
        if (typeof data === "object" && data !== null) {
          console.log("Attempting to convert object to array");
          data = [data];
        } else {
          setError("Invalid data format received from server.");
          setIsLoading(false);
          return;
        }
      }

      console.log("Current user ID:", session.user.id);
      console.log("All posts length:", data.length);

      // Filter posts by the current user with comprehensive null checks
      const userPosts = data
        .filter((post) => {
          // Skip null or undefined posts
          if (!post) {
            console.log("Encountered null post in data array");
            return false;
          }

          // Skip posts without IDs
          if (!post.id) {
            console.log("Post has no ID, skipping");
            return false;
          }

          // Ensure post has an id for logging
          const postId = post.id || "unknown-id";

          // Handle potentially missing authorId
          if (!post.authorId) {
            console.log(`Post ${postId}: missing authorId`);
            return false;
          }

          const isUserPost = post.authorId === session.user.id;
          console.log(
            `Post ${postId}: authorId=${post.authorId}, isUserPost=${isUserPost}`
          );
          return isUserPost;
        })
        // Ensure posts have required properties
        .map((post) => ({
          id: post.id,
          title: post.title || "Untitled",
          content: post.content || "",
          published: !!post.published,
          createdAt: post.createdAt || new Date().toISOString(),
          updatedAt: post.updatedAt || new Date().toISOString(),
          authorId: post.authorId || "unknown",
        }));

      console.log("User posts found:", userPosts.length);
      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load your posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const createTestPost = async () => {
    try {
      setError("");
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Test Post ${new Date().toLocaleString()}`,
          content: "This is a test post created from the dashboard.",
          published: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create test post");
      }

      const post = await response.json();
      console.log("Test post created:", post);

      // Refresh the posts list
      fetchUserPosts();
    } catch (error: any) {
      console.error("Error creating test post:", error);
      setError(
        error.message || "Failed to create test post. Please try again."
      );
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove the deleted post from state
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Failed to delete post. Please try again.");
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: !post.published,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      const updatedPost = await response.json();

      // Update the post in state
      setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    } catch (error) {
      console.error("Error updating post:", error);
      setError("Failed to update post. Please try again.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Your Dashboard</h1>
        <div className="flex space-x-3">
          <button
            onClick={createTestPost}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Create Test Post
          </button>
          <Link
            href="/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Create New Post
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your posts...</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-2 text-black">
            No posts yet
          </h2>
          <p className="text-black mb-6">
            Start writing your first blog post today!
          </p>
          <Link
            href="/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <Link
                        href={`/blog/${post.id}`}
                        className="hover:text-blue-600"
                      >
                        {post.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`px-3 py-1 rounded-md ${
                          post.published
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                      >
                        {post.published ? "Unpublish" : "Publish"}
                      </button>
                      <Link
                        href={`/edit/${post.id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
