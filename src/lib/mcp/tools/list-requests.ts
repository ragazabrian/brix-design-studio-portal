import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_asset_requests",
  title: "List asset requests",
  description: "List asset requests and their statuses for projects visible to the signed in user.",
  inputSchema: {
    project_id: z.string().uuid().optional().describe("Optional project ID."),
    limit: z.number().int().min(1).max(100).default(50).describe("How many requests to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ project_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated.");
    let query = supabaseForUser(ctx)
      .from("asset_requests")
      .select("id, title, brief, kind, status, hours_requested, project_id, requested_by, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (project_id) query = query.eq("project_id", project_id);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return { content: [{ type: "text" as const, text: JSON.stringify(data ?? [], null, 2) }], structuredContent: { requests: data ?? [] } };
  },
});
