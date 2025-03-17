import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import mongoose from "mongoose";

// Type definitions for better TypeScript support
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Session {
  user?: User;
}

interface PostDocument {
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
        email: string;
        image?: string;
      }
    | string;
  __v?: number; // Mongoose version key
}

interface TransformedPost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
}

// GET all posts
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    console.log("Current user session:", session?.user);

    await dbConnect();

    const postsDoc = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "authorId",
        select: "_id name email image",
      })
      .lean();

    console.log("Total posts found:", postsDoc.length);

    // Safe type assertion
    const posts = postsDoc as unknown as PostDocument[];

    // For debugging, log post authors
    posts.forEach((post) => {
      const authorId =
        typeof post.authorId === "string"
          ? post.authorId
          : post.authorId._id.toString();

      const authorName =
        typeof post.authorId === "string" ? "Unknown" : post.authorId.name;

      console.log("Post:", {
        id: post._id.toString(),
        title: post.title,
        authorId: authorId,
        authorName: authorName,
      });
    });

    const transformedPosts: TransformedPost[] = posts.map((post) => {
      const authorId =
        typeof post.authorId === "string"
          ? post.authorId
          : post.authorId._id.toString();

      const authorName =
        typeof post.authorId === "string" ? "Unknown" : post.authorId.name;

      return {
        id: post._id.toString(),
        title: post.title,
        content: post.content ? post.content.substring(0, 100) + "..." : "",
        published: post.published,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: authorId,
        authorName: authorName,
      };
    });

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST create a new post
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    console.log("Creating post with author ID:", session.user.id);

    const {
      title,
      content,
      published = false,
    } = (await request.json()) as {
      title: string;
      content: string;
      published?: boolean;
    };

    const post = new Post({
      title,
      content,
      published,
      authorId: session.user.id,
    });

    await post.save();

    return NextResponse.json(
      {
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        published: post.published,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: post.authorId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
