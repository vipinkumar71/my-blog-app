import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import mongoose from "mongoose";

// Interface for MongoDB document structure
interface MongoPost {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId:
    | {
        _id: mongoose.Types.ObjectId | string;
        name: string;
        email?: string;
        image?: string;
      }
    | string;
  __v?: number; // Mongoose version key
}

// Use dynamic rendering for blog posts
export const dynamic = "force-dynamic";

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }) {
  await dbConnect();

  const id = params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      title: "Post Not Found",
    };
  }

  const postDoc = await Post.findById(id).lean();

  if (!postDoc) {
    return {
      title: "Post Not Found",
    };
  }

  // Safe type assertion
  const post = postDoc as unknown as MongoPost;

  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}

export default async function BlogPost({ params }: { params: { id: string } }) {
  await dbConnect();

  const id = params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  const postDoc = await Post.findById(id)
    .populate({
      path: "authorId",
      select: "_id name image",
    })
    .lean();

  if (!postDoc) {
    notFound();
  }

  // Safe type assertion
  const post = postDoc as unknown as MongoPost;

  // Check if authorId is a string or object
  const authorId =
    typeof post.authorId === "string"
      ? post.authorId
      : post.authorId._id.toString();

  // Create author object only if authorId is an object
  const author =
    typeof post.authorId !== "string"
      ? {
          id: post.authorId._id.toString(),
          name: post.authorId.name,
          image: post.authorId.image,
        }
      : {
          id: authorId,
          name: "Unknown",
          image: undefined,
        };

  // Transform data to match the Prisma format
  const transformedPost = {
    id: post._id.toString(),
    title: post.title,
    content: post.content,
    published: post.published,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorId: authorId,
    author: author,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/blog"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Blog
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Featured Image */}
        <div className="h-64 md:h-96 bg-gray-200 relative">
          <Image
            src={`https://picsum.photos/seed/${transformedPost.id}/1200/600`}
            alt={transformedPost.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Post Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-blue-600">
              {transformedPost.title}
            </h1>
            <div className="flex items-center text-gray-600">
              <div className="flex items-center">
                {transformedPost.author.image ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={transformedPost.author.image}
                      alt={transformedPost.author.name || "Author"}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-medium text-blue-700">
                    {transformedPost.author.name || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(
                      new Date(transformedPost.createdAt),
                      "MMMM d, yyyy"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose max-w-none">
            {transformedPost.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
