import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import mongoose from "mongoose";
import { safeDocument, createSafeAuthor } from "@/lib/mongoUtils";

// Interface for MongoDB document structure
interface MongoPost {
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
    | null; // Can be string when not populated
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

    // Use our utilities to safely process the document
    const safePost = safeDocument<MongoPost>(postDoc, id);
    const author = createSafeAuthor(postDoc);

    // Create a transformed post with all necessary data
    const transformedPost = {
      id: safePost.id,
      title: safePost.title || "Untitled",
      content: safePost.content || "",
      published: !!safePost.published,
      createdAt: safePost.createdAt || new Date().toISOString(),
      updatedAt: safePost.updatedAt || new Date().toISOString(),
      authorId: author.id,
      author: author,
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

    // Use our utility to safely process the document
    const existingPost = safeDocument<MongoPost>(existingPostDoc, id);
    const author = createSafeAuthor(existingPostDoc);

    if (author.id !== session.user.id) {
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

    if (!updatedPostDoc) {
      return NextResponse.json(
        { message: "Failed to update post" },
        { status: 500 }
      );
    }

    // Use our utilities to safely process the updated document
    const updatedPost = safeDocument<MongoPost>(updatedPostDoc, id);
    const updatedAuthor = createSafeAuthor(updatedPostDoc);

    // Create a transformed post with all necessary data
    const transformedPost = {
      id: updatedPost.id,
      title: updatedPost.title || "Untitled",
      content: updatedPost.content || "",
      published: !!updatedPost.published,
      createdAt: updatedPost.createdAt || new Date().toISOString(),
      updatedAt: updatedPost.updatedAt || new Date().toISOString(),
      authorId: updatedAuthor.id,
      author: updatedAuthor,
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

    // Use our utility to safely process the document
    const existingPost = safeDocument<MongoPost>(existingPostDoc, id);
    const author = createSafeAuthor(existingPostDoc);

    if (author.id !== session.user.id) {
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
