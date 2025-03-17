import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";

// Use getStaticProps pattern in App Router
export async function generateStaticParams() {
  return [];
}

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  await dbConnect();

  const posts = await Post.find({ published: true })
    .populate({
      path: "authorId",
      select: "_id name image",
    })
    .sort({ createdAt: -1 })
    .lean();

  // Transform data to match the Prisma format
  const transformedPosts = posts.map((post) => ({
    id: post._id.toString(),
    title: post.title,
    content: post.content,
    published: post.published,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorId: post.authorId._id.toString(),
    author: {
      id: post.authorId._id.toString(),
      name: post.authorId.name,
      image: post.authorId.image,
    },
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-blue-600">
          Our Blog
        </h1>
        <p className="text-white max-w-2xl mx-auto">
          Discover the latest articles, tutorials, and insights from our
          community of writers.
        </p>
      </div>

      {transformedPosts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            No posts yet
          </h2>
          <p className="text-gray-600 mb-6">
            Be the first to publish a blog post!
          </p>
          <Link
            href="/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Create Post
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {transformedPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
            >
              {/* Placeholder image - in a real app, you'd store image URLs in your database */}
              <div className="h-48 bg-gray-200 relative">
                <Image
                  src={`https://picsum.photos/seed/${post.id}/800/400`}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex-grow">
                <h2 className="text-xl font-semibold mb-2 line-clamp-2 text-blue-700">
                  <Link
                    href={`/blog/${post.id}`}
                    className="hover:text-blue-600 transition text-blue-700"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.content.substring(0, 150)}
                  {post.content.length > 150 ? "..." : ""}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-700">
                    {post.author.name || "Anonymous"}
                  </span>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <Link
                  href={`/blog/${post.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
