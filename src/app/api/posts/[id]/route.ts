import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
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
        email: string;
        image?: string;
      }
    | string; // Can be string when not populated
  __v?: number; // Mongoose version key
}

// GET a single post by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Properly await the params object
    const params = await context.params;
    const id = params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const postDoc = await Post.findById(id)
      .populate({
        path: "authorId",
        select: "_id name email image",
      })
      .lean();

    if (!postDoc) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Safe type assertion
    const post = postDoc as unknown as MongoPost;

    // Transform to match the Prisma format
    const transformedPost = {
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId:
        typeof post.authorId === "string"
          ? post.authorId
          : post.authorId._id.toString(),
      author:
        typeof post.authorId !== "string"
          ? {
              id: post.authorId._id.toString(),
              name: post.authorId.name,
              email: post.authorId.email,
              image: post.authorId.image,
            }
          : undefined,
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PATCH update a post
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Properly await the params object
    const params = await context.params;
    const id = params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // Check if post exists and belongs to the user
    const existingPostDoc = await Post.findById(id).lean();

    if (!existingPostDoc) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Safe type assertion
    const existingPost = existingPostDoc as unknown as MongoPost;

    // Check author ID - need to handle string or object
    const authorId =
      typeof existingPost.authorId === "string"
        ? existingPost.authorId
        : existingPost.authorId._id.toString();

    if (authorId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only edit your own posts" },
        { status: 403 }
      );
    }

    const { title, content, published } = await request.json();

    const updateData: {
      title?: string;
      content?: string;
      published?: boolean;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (published !== undefined) updateData.published = published;

    const updatedPostDoc = await Post.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate({
        path: "authorId",
        select: "_id name email image",
      })
      .lean();

    // Safe type assertion
    const updatedPost = updatedPostDoc as unknown as MongoPost;

    // Transform to match the Prisma format
    const transformedPost = {
      id: updatedPost._id.toString(),
      title: updatedPost.title,
      content: updatedPost.content,
      published: updatedPost.published,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      authorId:
        typeof updatedPost.authorId === "string"
          ? updatedPost.authorId
          : updatedPost.authorId._id.toString(),
      author:
        typeof updatedPost.authorId !== "string"
          ? {
              id: updatedPost.authorId._id.toString(),
              name: updatedPost.authorId.name,
              email: updatedPost.authorId.email,
              image: updatedPost.authorId.image,
            }
          : undefined,
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE a post
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Properly await the params object
    const params = await context.params;
    const id = params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // Check if post exists and belongs to the user
    const existingPostDoc = await Post.findById(id).lean();

    if (!existingPostDoc) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Safe type assertion
    const existingPost = existingPostDoc as unknown as MongoPost;

    // Check author ID - need to handle string or object
    const authorId =
      typeof existingPost.authorId === "string"
        ? existingPost.authorId
        : existingPost.authorId._id.toString();

    if (authorId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only delete your own posts" },
        { status: 403 }
      );
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
