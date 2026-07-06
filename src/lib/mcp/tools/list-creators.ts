import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_creators",
  title: "List creators",
  description: "Search creator profiles on Texon by username or display name.",
  inputSchema: {
    search: z
      .string()
      .optional()
      .describe("Case-insensitive substring against username or display_name."),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("profiles")
      .select("id,username,display_name,bio")
      .order("username")
      .limit(limit ?? 20);
    if (search) {
      q = q.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { creators: data ?? [] },
    };
  },
});
