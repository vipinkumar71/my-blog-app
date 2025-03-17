"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation"; // Not used
import useAuthStore from "@/store/authStore";

export default function EditProfilePage() {
  const { data: session, update: updateSession } = useSession();
  // const router = useRouter(); // Not used
  const { setSession } = useAuthStore();

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Fetch current user data
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await response.json();
        setName(userData.name || "");
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load your profile data. Please try again.");
      }
    }

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Keep the existing image if present in the session
      const image = session?.user?.image || "";

      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update profile");
      }

      const updatedUser = await response.json();

      // Create updated session with new user data
      const updatedSession = {
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          image: updatedUser.image,
        },
      };

      // Update NextAuth session
      await updateSession(updatedSession);

      // Update Zustand store
      setSession(updatedSession);

      setSuccess("Profile updated successfully!");
      setIsLoading(false);

      // No redirect - stay on the profile edit page
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-gray-800">Please sign in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Edit Profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
            required
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
