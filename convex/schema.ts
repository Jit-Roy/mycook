import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    password: v.string(),
  }).index("by_email", ["email"]),
  conversations: defineTable({
    email: v.string(),
    data: v.array(v.any()),
  }).index("by_email", ["email"]),
  // Define other tables as needed
});
