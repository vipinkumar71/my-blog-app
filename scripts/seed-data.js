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

// Sample seed data
const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "adminPassword123",
    image: "https://i.pravatar.cc/150?u=admin@example.com",
    emailVerified: new Date(),
  },
  {
    name: "Test User",
    email: "user@example.com",
    password: "userPassword123",
    image: "https://i.pravatar.cc/150?u=user@example.com",
    emailVerified: new Date(),
  },
];

const samplePosts = [
  {
    title: "Getting Started with Next.js",
    content:
      "Next.js is a powerful React framework that makes building web applications easy...",
    published: true,
  },
  {
    title: "MongoDB for Beginners",
    content:
      "MongoDB is a popular NoSQL database that stores data in JSON-like documents...",
    published: true,
  },
  {
    title: "Authentication Best Practices",
    content:
      "Implementing secure authentication is crucial for web applications...",
    published: true,
  },
  {
    title: "Draft Post Example",
    content:
      "This is an unpublished draft post that demonstrates the publishing workflow...",
    published: false,
  },
];

/**
 * Seeds the database with sample users and posts
 */
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log("Cleared existing data");

    // Create users with hashed passwords
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      users.push(user);
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    // Create posts linked to random users
    const posts = [];
    for (const postData of samplePosts) {
      // Select a random user as author
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const post = await Post.create({
        ...postData,
        authorId: randomUser._id,
      });
      posts.push(post);
      console.log(`Created post: ${post.title} by ${randomUser.name}`);
    }

    console.log("\nDatabase seeding completed successfully!");
    console.log(`Created ${users.length} users and ${posts.length} posts`);

    return { users, posts };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log("Seeding complete! You can now start your application.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  });
