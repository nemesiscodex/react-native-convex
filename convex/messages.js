import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const MAX_MESSAGES = 10;

// Validation constants
const BODY_MIN_LENGTH = 1;
const BODY_MAX_LENGTH = 2000;
const AUTHOR_MAX_LENGTH = 100;
const DEFAULT_AUTHOR = "Guest";

export const list = query({
  handler: async (ctx) => {
    // Get the latest 10 messages by creation time (descending order)
    const latestMessages = await ctx.db.query("messages").order("desc").take(MAX_MESSAGES);
    
    // Reverse the array so newest messages appear at the bottom
    // This gives us the latest 10 messages in chronological order (oldest to newest)
    return latestMessages.reverse();
  },
});

export const send = mutation({
  args: {
    body: v.string(),
    author: v.union(v.string(), v.null()),
  },
  handler: async (ctx, { body, author }) => {
    // Validate and sanitize body
    if (typeof body !== "string") {
      throw new Error("Body must be a string");
    }
    
    const sanitizedBody = body.trim();
    if (sanitizedBody.length < BODY_MIN_LENGTH) {
      throw new Error(`Body must be at least ${BODY_MIN_LENGTH} character long`);
    }
    if (sanitizedBody.length > BODY_MAX_LENGTH) {
      throw new Error(`Body must be no more than ${BODY_MAX_LENGTH} characters long`);
    }

    // Validate and sanitize author
    let sanitizedAuthor = author;
    if (author === null || author === undefined) {
      sanitizedAuthor = DEFAULT_AUTHOR;
    } else if (typeof author === "string") {
      sanitizedAuthor = author.trim();
      if (sanitizedAuthor.length === 0) {
        sanitizedAuthor = DEFAULT_AUTHOR;
      } else if (sanitizedAuthor.length > AUTHOR_MAX_LENGTH) {
        throw new Error(`Author must be no more than ${AUTHOR_MAX_LENGTH} characters long`);
      }
    } else {
      throw new Error("Author must be a string or null");
    }

    // Create message object with sanitized values
    const message = { 
      body: sanitizedBody, 
      author: sanitizedAuthor 
    };

    // Insert message and return the inserted document
    const messageId = await ctx.db.insert("messages", message);
    
    // Return the inserted message data
    return {
      _id: messageId,
      ...message,
      _creationTime: Date.now(), // Approximate creation time
    };
  },
});
