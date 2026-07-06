import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_public_videos",
  title: "List public videos",
  description:
    "List the most recent public videos on Texon. Returns id, title, creator, type, views, duration, and created_at.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Maximum number of videos to return (default 20, max 50)."),
    type: z
      .enum(["short", "series", "film"])
      .optional()
      .describe("Filter by video type."),
    search: z
      .string()
      .optional()
      .describe("Case-insensitive substring match against title."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, type, search }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("videos")
      .select("id,title,type,views,duration_seconds,created_at,creator_id,tags")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (type) q = q.eq("type", type);
    if (search) q = q.ilike("title", `%${search}%`);
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { videos: data ?? [] },
    };
  },
});
