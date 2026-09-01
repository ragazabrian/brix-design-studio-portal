import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_projects",
  title: "List projects",
  description: "List the studio projects the signed in user can see, newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("How many projects to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, status, client_name, description, starts_on, due_on, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return errorResult(error.message);
    if (!data?.length) return textResult("No projects are visible to this account.");
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      structuredContent: { projects: data },
    };
  },
});
