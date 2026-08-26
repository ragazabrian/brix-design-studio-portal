import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "designer" | "client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);

  return { session, ready, user: session?.user ?? null };
}

/**
 * Keeps the profile row in step with the identity data Google returns, so a
 * name or avatar change upstream shows up in the portal.
 */
export function useProfile(userId: string | undefined, identity?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;

      const fullName = (identity?.["full_name"] ?? identity?.["name"]) as string | undefined;
      const avatarUrl = (identity?.["avatar_url"] ?? identity?.["picture"]) as string | undefined;

      const needsSync =
        data &&
        ((fullName && data.full_name !== fullName) || (avatarUrl && data.avatar_url !== avatarUrl));

      if (needsSync) {
        const { data: updated } = await supabase
          .from("profiles")
          .update({
            full_name: fullName ?? data.full_name,
            avatar_url: avatarUrl ?? data.avatar_url,
          })
          .eq("id", userId!)
          .select("*")
          .maybeSingle();
        return updated ?? data;
      }

      return data;
    },
  });
}

export function useRoles(userId: string | undefined) {
  return useQuery({
    queryKey: ["roles", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((row) => row.role as AppRole);
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProjectFiles(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-files", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const paths = (data ?? []).map((file) => file.storage_path);
      let urls: Record<string, string> = {};
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage
          .from("project-files")
          .createSignedUrls(paths, 3600);
        urls = Object.fromEntries(
          (signed ?? [])
            .filter((item) => item.signedUrl)
            .map((item, index) => [paths[index], item.signedUrl]),
        );
      }

      return (data ?? []).map((file) => ({ ...file, url: urls[file.storage_path] ?? null }));
    },
  });
}

export function useTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: ["tasks", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTimeEntries(projectId: string | undefined) {
  return useQuery({
    queryKey: ["time-entries", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("project_id", projectId!)
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useIntegrations() {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("integration_connections").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}
