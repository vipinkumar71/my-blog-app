import mongoose from "mongoose";

/**
 * Safely converts a MongoDB document to a plain object with proper ID handling
 * Prevents null reference errors when accessing _id
 */
export function safeDocument<T extends Record<string, any>>(
  doc: any | null | undefined,
  fallbackId: string = "unknown"
): T & { id: string } {
  if (!doc) {
    console.warn("Attempted to process null or undefined document");
    return { id: fallbackId } as T & { id: string };
  }

  // Convert to plain object if it's a Mongoose document
  const obj = doc.toObject ? doc.toObject() : { ...doc };

  // Safely handle _id
  if (obj._id) {
    obj.id = typeof obj._id === "string" ? obj._id : obj._id.toString();
  } else {
    obj.id = fallbackId;
  }

  // Remove the _id property to avoid confusion
  delete obj._id;

  return obj as T & { id: string };
}

/**
 * Safely extracts an authorId from a document, handling all possible formats
 */
export function getAuthorId(doc: any | null | undefined): string {
  if (!doc) return "unknown";

  try {
    if (!doc.authorId) return "unknown";

    if (typeof doc.authorId === "string") {
      return doc.authorId;
    }

    if (typeof doc.authorId === "object" && doc.authorId !== null) {
      if (doc.authorId._id) {
        return typeof doc.authorId._id === "string"
          ? doc.authorId._id
          : doc.authorId._id.toString();
      }

      if (doc.authorId.id) {
        return doc.authorId.id;
      }
    }

    return "unknown";
  } catch (error) {
    console.error("Error extracting author ID:", error);
    return "unknown";
  }
}

/**
 * Creates a safe author object from document data
 */
export function createSafeAuthor(doc: any | null | undefined) {
  if (!doc) return { id: "unknown", name: "Unknown Author", image: undefined };

  try {
    if (!doc.authorId) {
      return { id: "unknown", name: "Unknown Author", image: undefined };
    }

    if (typeof doc.authorId === "string") {
      return { id: doc.authorId, name: "Unknown Author", image: undefined };
    }

    if (typeof doc.authorId === "object" && doc.authorId !== null) {
      const id = doc.authorId._id
        ? typeof doc.authorId._id === "string"
          ? doc.authorId._id
          : doc.authorId._id.toString()
        : doc.authorId.id || "unknown";

      return {
        id,
        name: doc.authorId.name || "Unknown Author",
        email: doc.authorId.email || "",
        image: doc.authorId.image,
      };
    }

    return { id: "unknown", name: "Unknown Author", image: undefined };
  } catch (error) {
    console.error("Error creating safe author:", error);
    return { id: "unknown", name: "Unknown Author", image: undefined };
  }
}

/**
 * Process an array of documents safely, filtering out nulls and handling _id conversions
 */
export function processSafeDocuments<T extends Record<string, any>>(
  docs: any[] | null | undefined
): (T & { id: string })[] {
  if (!docs || !Array.isArray(docs)) {
    console.warn(
      "Attempted to process null, undefined, or non-array documents"
    );
    return [];
  }

  return docs
    .filter((doc) => doc !== null && doc !== undefined)
    .map((doc) => safeDocument<T>(doc));
}
