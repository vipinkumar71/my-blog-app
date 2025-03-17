"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import useAuthStore from "@/store/authStore";
import Image from "next/image";

/**
 * Navigation component that displays differently based on authentication status
 */
export default function Navbar(): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const { session, status } = useAuthStore();
  const { data: nextAuthSession } = useSession();

  // Use state to track the displayed user name
  const [userName, setUserName] = useState<string>("");
  const [userImage, setUserImage] = useState<string>("");

  // Create a memoized fetch function
  const fetchLatestUserData = useCallback(async (): Promise<void> => {
    if (status === "authenticated") {
      try {
        // Using fixed parameter to avoid dependency on changing values
        const response = await fetch(`/api/user`);
        if (response.ok) {
          const userData = (await response.json()) as {
            name?: string;
            image?: string;
          };
          // Only log in development environment
          if (process.env.NODE_ENV === "development") {
            console.log("Navbar: Fetched latest user data:", userData.name);
          }
          setUserName(userData.name || "");
          setUserImage(userData.image || "");
          return;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    // Fall back to session data if API fetch fails
    if (nextAuthSession?.user?.name) {
      setUserName(nextAuthSession.user.name);
      setUserImage(nextAuthSession.user.image || "");
      // Only log in development environment
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Navbar: Using NextAuth session name:",
          nextAuthSession.user.name
        );
      }
    } else if (session?.user?.name) {
      setUserName(session.user.name);
      setUserImage(session.user.image || "");
      // Only log in development environment
      if (process.env.NODE_ENV === "development") {
        console.log("Navbar: Using Zustand store name:", session.user.name);
      }
    }
  }, [status, session, nextAuthSession]);

  // Fetch user data when authentication status changes or session updates
  useEffect(() => {
    fetchLatestUserData();
  }, [fetchLatestUserData]);

  const isActive = (path: string): boolean => pathname === path;

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Blog Platform
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md ${
                isActive("/") ? "bg-gray-900" : "hover:bg-gray-700"
              }`}
            >
              Home
            </Link>
            <Link
              href="/blog"
              className={`px-3 py-2 rounded-md ${
                isActive("/blog") ? "bg-gray-900" : "hover:bg-gray-700"
              }`}
            >
              Blog
            </Link>

            {status === "authenticated" && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md ${
                    isActive("/dashboard") ? "bg-gray-900" : "hover:bg-gray-700"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className={`px-3 py-2 rounded-md ${
                    isActive("/create") ? "bg-gray-900" : "hover:bg-gray-700"
                  }`}
                >
                  Create Post
                </Link>
              </>
            )}

            {status === "unauthenticated" ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md hover:bg-gray-700 text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              status === "authenticated" && (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/profile/edit"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                      isActive("/profile/edit")
                        ? "bg-gray-900"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    {userImage && (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={userImage}
                          alt={userName || "User"}
                          width={32}
                          height={32}
                        />
                      </div>
                    )}
                    <span className="text-sm">{userName}</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-2 rounded-md hover:bg-gray-700"
                  >
                    Log out
                  </button>
                </div>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md ${
                isActive("/") ? "bg-gray-900" : "hover:bg-gray-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/blog"
              className={`block px-3 py-2 rounded-md ${
                isActive("/blog") ? "bg-gray-900" : "hover:bg-gray-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>

            {status === "authenticated" && (
              <>
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md ${
                    isActive("/dashboard") ? "bg-gray-900" : "hover:bg-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className={`block px-3 py-2 rounded-md ${
                    isActive("/create") ? "bg-gray-900" : "hover:bg-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Post
                </Link>
              </>
            )}

            {status === "unauthenticated" ? (
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            ) : (
              status === "authenticated" && (
                <div className="space-y-1">
                  <Link
                    href="/profile/edit"
                    className="block px-3 py-2 rounded-md hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      {userImage && (
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={userImage}
                            alt={userName || "User"}
                            width={32}
                            height={32}
                          />
                        </div>
                      )}
                      <span className="text-sm">{userName}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-700"
                  >
                    Log out
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
