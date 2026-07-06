import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "get_video",
  title: "Get video details",
  description:
    "Fetch a single public video by id, including title, description, tags, views, and creator profile.",
  inputSchema: {
    id: z.string().uuid().describe("Video UUID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: video, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .eq("visibility", "public")
      .maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    if (!video) {
      return { content: [{ type: "text", text: "Video not found" }], isError: true };
    }
    const { data: creator } = await supabase
      .from("profiles")
      .select("id,username,display_name")
      .eq("id", video.creator_id)
      .maybeSingle();
    const result = { ...video, creator };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: { video: result },
    };
  },
});
