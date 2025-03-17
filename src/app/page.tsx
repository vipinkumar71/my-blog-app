"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import useAuthStore from "@/store/authStore";

export default function Home() {
  const { status } = useAuthStore();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-600">
          Welcome to Our Blog Platform
        </h1>
        <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
          Share your thoughts, read interesting articles, and connect with other
          writers.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/blog"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Read Blog
          </Link>
          {!isAuthenticated && (
            <Link
              href="/register"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Join Now
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/create"
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Create Post
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">
            Why Choose Our Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-700">
                Easy to Use
              </h3>
              <p className="text-gray-600">
                Our intuitive interface makes it simple to create, edit, and
                publish your blog posts.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-700">
                Secure Authentication
              </h3>
              <p className="text-gray-600">
                Your account is protected with modern authentication methods to
                keep your content safe.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-700">
                Community Engagement
              </h3>
              <p className="text-gray-600">
                Connect with readers and other writers to grow your audience and
                improve your content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          {!isAuthenticated ? (
            <>
              <h2 className="text-3xl font-bold mb-6">
                Ready to Start Blogging?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of writers who share their knowledge,
                experiences, and stories on our platform.
              </p>
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition"
              >
                Create Your Account
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-6">Share Your Knowledge</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Ready to write your next post? Share your expertise and ideas
                with our community.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/create"
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition"
                >
                  Create New Post
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-3 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-900 transition"
                >
                  View Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
