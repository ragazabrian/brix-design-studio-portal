import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_asset_request",
  title: "Create asset request",
  description: "Create an asset request for a project as the signed in user.",
  inputSchema: {
    project_id: z.string().uuid().describe("Project to request work for."),
    title: z.string().trim().min(1).max(160).describe("Short request title."),
    brief: z.string().trim().max(5000).optional().describe("Request details."),
    kind: z.string().trim().max(80).default("design").describe("Type of asset requested."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ project_id, title, brief, kind }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("asset_requests")
      .insert({ project_id, title, brief: brief ?? null, kind: kind ?? "design", requested_by: ctx.getUserId() })
      .select("id, title, brief, kind, status, project_id, created_at")
      .single();
    if (error) return errorResult(error.message);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: { request: data } };
  },
});
