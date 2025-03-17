const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/blog_db")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// Import models here to avoid path resolution issues
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    emailVerified: Date,
    image: String,
    password: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  })
);

const Post = mongoose.model(
  "Post",
  new mongoose.Schema({
    title: {
      type: String,
      required: [true, "Please provide a title for this post."],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide content for this post."],
    },
    published: {
      type: Boolean,
      default: false,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  })
);

async function seedDatabase() {
  try {
    // Delete existing data
    await User.deleteMany({});
    await Post.deleteMany({});

    console.log("Cleared existing data");

    // Create a dummy user
    const password = await bcrypt.hash("password123", 10);
    const user = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: password,
      image: "https://i.pravatar.cc/150?u=john",
    });

    console.log("Created user:", user.email);

    // Create sample posts
    const posts = [
      {
        title: "Getting Started with Next.js",
        content: `Next.js is a powerful React framework that provides a great developer experience with all the features you need for production.

In this post, we'll explore the basics of Next.js and how to get started with your first project.

Next.js provides features like:
- Server-side rendering
- Static site generation
- API routes
- Built-in CSS and Sass support
- Fast refresh
- TypeScript support

To create a new Next.js app, you can use the create-next-app command:

\`\`\`
npx create-next-app@latest my-next-app
\`\`\`

This will set up everything you need to get started with a new Next.js project.`,
        published: true,
        authorId: user._id,
      },
      {
        title: "Working with MongoDB in Next.js",
        content: `MongoDB is a popular NoSQL database that works excellently with Next.js applications.

In this tutorial, we'll learn how to integrate MongoDB with a Next.js application using Mongoose.

First, you'll need to install the necessary dependencies:

\`\`\`
npm install mongoose
\`\`\`

Then, create a connection utility file to handle the MongoDB connection:

\`\`\`
// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(mongoose => mongoose);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
\`\`\`

This utility helps maintain a single connection to the database across your application.`,
        published: true,
        authorId: user._id,
      },
      {
        title: "Building a Blog with Next.js and MongoDB",
        content: `Creating a blog is a great way to learn web development. In this post, we'll walk through the process of building a full-featured blog using Next.js and MongoDB.

Our blog will include:
- User authentication
- Creating and editing posts
- Commenting system
- Like functionality
- Responsive design

We'll structure our application following best practices and use various Next.js features like API routes, server components, and incremental static regeneration.

The first step is setting up our project structure:

\`\`\`
my-blog/
  ├── components/
  ├── lib/
  ├── models/
  ├── pages/
  ├── public/
  ├── styles/
  ├── .env
  ├── package.json
  └── next.config.js
\`\`\`

Next, we'll define our data models and set up the MongoDB connection...`,
        published: true,
        authorId: user._id,
      },
      {
        title: "Advanced MongoDB Techniques",
        content: `MongoDB offers powerful features beyond basic CRUD operations. In this advanced guide, we'll explore techniques that can take your application to the next level.

Topics covered:
- Aggregation pipelines
- Indexing strategies
- Transaction support
- Schema design patterns
- Performance optimization

The aggregation pipeline is one of MongoDB's most powerful features. It allows you to process data records and return computed results using a series of pipeline stages.

Here's an example of an aggregation pipeline that groups blog posts by author and counts them:

\`\`\`javascript
db.posts.aggregate([
  { $group: { _id: "$authorId", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
\`\`\`

This returns a list of authors sorted by the number of posts they've created.`,
        published: true,
        authorId: user._id,
      },
      {
        title: "Draft Post - Coming Soon",
        content:
          "This is a draft post that will be published soon. Stay tuned for more content!",
        published: false,
        authorId: user._id,
      },
    ];

    await Post.insertMany(posts);

    console.log(`Created ${posts.length} sample posts`);

    console.log("Database seeded successfully");

    // Close the connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
