#!/usr/bin/env node

// This script can be run from the command line to clean up orphaned posts
// Usage: node src/scripts/cleanupOrphanedPosts.js

import { bulkCleanupOrphanedPosts } from "../lib/cleanupOrphanedPosts.js";

async function runCleanup() {
  try {
    console.log("Starting cleanup of orphaned posts...");

    const result = await bulkCleanupOrphanedPosts();

    console.log("------------------------------");
    console.log("Cleanup Results:");
    console.log(`Deleted ${result.deleted} orphaned posts`);
    console.log("------------------------------");

    // Exit with success code
    process.exit(0);
  } catch (error) {
    console.error("Error during cleanup:", error);
    // Exit with error code
    process.exit(1);
  }
}

// Run the cleanup
runCleanup();
