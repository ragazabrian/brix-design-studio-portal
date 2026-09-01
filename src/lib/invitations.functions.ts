import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const roleSchema = z.enum(["admin", "designer", "client"]);
const tokenSchema = z.string().uuid();

async function requireAdmin(context: {
  supabase: {
    from: (table: "user_roles") => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          eq: (column: string, value: string) => {
            maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
          };
        };
      };
    };
  };
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Admin access is required.");
}

export const createPortalInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        email: z.string().trim().email().transform((value) => value.toLowerCase()),
        role: roleSchema,
        note: z.string().trim().max(500).optional(),
        projectIds: z.array(z.string().uuid()).max(50),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (data.role === "client" && data.projectIds.length === 0) {
      throw new Error("Choose at least one project for a client.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("invitations")
      .insert({
        email: data.email,
        role: data.role,
        note: data.note || null,
        invited_by: context.userId,
      })
      .select("id, token, expires_at")
      .single();
    if (invitationError || !invitation) {
      if (invitationError?.code === "23505") {
        throw new Error("A pending invitation already exists for this email.");
      }
      throw new Error("The invitation could not be created.");
    }

    if (data.projectIds.length > 0) {
      const { error: projectsError } = await supabaseAdmin.from("invitation_projects").insert(
        data.projectIds.map((projectId) => ({
          invitation_id: invitation.id,
          project_id: projectId,
        })),
      );
      if (projectsError) {
        await supabaseAdmin.from("invitations").delete().eq("id", invitation.id);
        throw new Error("The selected projects could not be attached to this invitation.");
      }
    }

    const request = getRequest();
    const origin = request ? new URL(request.url).origin : "https://brixdesignstudio.lovable.app";
    const redirectTo = `${origin}/invite?token=${encodeURIComponent(invitation.token)}`;
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      redirectTo,
      data: { brix_invitation_token: invitation.token },
    });
    if (emailError) {
      await supabaseAdmin.from("invitations").delete().eq("id", invitation.id);
      const existingAccount = /already|registered|exists/i.test(emailError.message);
      throw new Error(
        existingAccount
          ? "This email already has an account. Update their role from the People list instead."
          : "The invitation email could not be sent. Try again shortly.",
      );
    }

    return { id: invitation.id, expiresAt: invitation.expires_at };
  });

export const getPortalInvitation = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invitation } = await supabaseAdmin
      .from("invitations")
      .select("id, email, role, status, note, expires_at")
      .eq("token", data.token)
      .maybeSingle();
    if (!invitation) return { available: false as const, reason: "not_found" as const };
    if (invitation.status !== "pending") {
      return { available: false as const, reason: invitation.status };
    }
    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      await supabaseAdmin.from("invitations").update({ status: "expired" }).eq("id", invitation.id);
      return { available: false as const, reason: "expired" as const };
    }

    const { data: assignments } = await supabaseAdmin
      .from("invitation_projects")
      .select("projects(name)")
      .eq("invitation_id", invitation.id);
    const projects = (assignments ?? []).flatMap((assignment) => {
      const project = assignment.projects;
      if (!project || Array.isArray(project)) return [];
      return [project.name];
    });
    return {
      available: true as const,
      email: invitation.email,
      role: invitation.role,
      note: invitation.note,
      expiresAt: invitation.expires_at,
      projects,
    };
  });

export const acceptPortalInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const email = typeof context.claims.email === "string" ? context.claims.email : null;
    if (!email) throw new Error("Your signed-in account does not have an email address.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("complete_portal_invitation", {
      _token: data.token,
      _user_id: context.userId,
      _email: email,
    });
    if (error) throw new Error(error.message);
    const accepted = result?.[0];
    if (!accepted) throw new Error("The invitation could not be accepted.");
    return { role: accepted.role, destination: accepted.destination };
  });