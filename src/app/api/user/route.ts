import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// Define interfaces for better type checking
interface UserDocument {
  _id: string;
  name: string;
  email: string;
  image?: string;
  password?: string;
}

interface Session {
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface UpdateUserRequest {
  name: string;
  image?: string;
}

// GET current user data
export async function GET(): Promise<NextResponse> {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = (await User.findById(
      session.user.id
    ).lean()) as UserDocument | null;

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return user data without sensitive information
    const response: UserResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, image } = (await request.json()) as UpdateUserRequest;

    // Validate input
    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update user
    const updatedUser = (await User.findByIdAndUpdate(
      session.user.id,
      { name, image },
      { new: true }
    ).lean()) as UserDocument | null;

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("User profile updated:", {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      prevName: session.user.name,
    });

    // Return updated user data
    const response: UserResponse = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
