import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConversationsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    return conversation?.data || [];
  },
});

export const updateConversations = mutation({
  args: { email: v.string(), conversations: v.array(v.any()) },
  handler: async (ctx, args) => {
    const { email, conversations } = args;
    await ctx.db.insert("conversations", { email, data: conversations });
  },
});
