import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import mongoose from "mongoose";
import {
  safeDocument,
  processSafeDocuments,
  getAuthorId,
  createSafeAuthor,
} from "@/lib/mongoUtils";

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
  _id?: mongoose.Types.ObjectId | string;
  title?: string;
  content?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authorId?:
    | {
        _id?: mongoose.Types.ObjectId | string;
        name?: string;
        email?: string;
        image?: string;
      }
    | string
    | null;
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

    console.log("Total posts found:", postsDoc?.length || 0);

    // Use our utility to safely process all documents
    const safePosts = processSafeDocuments<PostDocument>(postsDoc);

    console.log("Successfully processed posts:", safePosts.length);

    // Transform posts to the expected format
    const transformedPosts = safePosts.map((post) => {
      // Use our utility to get author info
      const author = createSafeAuthor({ authorId: post.authorId });

      return {
        id: post.id,
        title: post.title || "Untitled",
        content: post.content ? post.content.substring(0, 100) + "..." : "",
        published: !!post.published,
        createdAt: post.createdAt || new Date().toISOString(),
        updatedAt: post.updatedAt || new Date().toISOString(),
        authorId: author.id,
        authorName: author.name || "Unknown",
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

    // Use our utility to safely process the new post
    const safePost = safeDocument<PostDocument>(post);

    return NextResponse.json(
      {
        id: safePost.id,
        title: safePost.title || "",
        content: safePost.content || "",
        published: !!safePost.published,
        createdAt: safePost.createdAt || new Date().toISOString(),
        updatedAt: safePost.updatedAt || new Date().toISOString(),
        authorId: safePost.authorId?.toString() || session.user.id,
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
