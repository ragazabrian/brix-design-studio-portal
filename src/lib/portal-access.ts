import { redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export async function requirePortalRole(kind: "staff" | "client") {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw redirect({ to: kind === "client" ? "/client-login" : "/portal" });

  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userData.user.id),
    supabase.from("profiles").select("is_active").eq("id", userData.user.id).maybeSingle(),
  ]);
  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    throw redirect({ to: kind === "client" ? "/client-login" : "/portal" });
  }

  const isStaff = (roles ?? []).some((item) => item.role === "admin" || item.role === "designer");
  const isClient = (roles ?? []).some((item) => item.role === "client");
  if (kind === "client" && !isClient) throw redirect({ to: "/dashboard" });
  if (kind === "staff" && !isStaff) throw redirect({ to: "/client/dashboard" });
}