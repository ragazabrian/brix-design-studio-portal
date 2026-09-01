import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_library_assets",
  title: "List library assets",
  description: "List brand and project assets the signed in user can access, optionally filtered by project or search text.",
  inputSchema: {
    project_id: z.string().uuid().optional().describe("Optional project ID."),
    search: z.string().trim().max(100).optional().describe("Optional asset name search."),
    limit: z.number().int().min(1).max(100).default(50).describe("How many assets to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ project_id, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated.");
    let query = supabaseForUser(ctx)
      .from("library_assets")
      .select("id, name, kind, description, mime_type, size_bytes, tags, project_id, storage_path, thumbnail_path, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit ?? 50);
    if (project_id) query = query.eq("project_id", project_id);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return { content: [{ type: "text" as const, text: JSON.stringify(data ?? [], null, 2) }], structuredContent: { assets: data ?? [] } };
  },
});
