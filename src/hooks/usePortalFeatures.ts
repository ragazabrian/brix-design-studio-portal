import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

const ACTIVE_PROJECT_KEY = "brix-portal-active-project";

/** Remembers which project the person was last looking at, per browser. */
export function useActiveProject(projects: Array<{ id: string }> | undefined) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!projects || projects.length === 0) return;
    setActiveId((current) => {
      if (current && projects.some((project) => project.id === current)) return current;
      const saved = window.localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (saved && projects.some((project) => project.id === saved)) return saved;
      return projects[0]!.id;
    });
  }, [projects]);

  function selectProject(id: string) {
    setActiveId(id);
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  }

  return { activeId, selectProject };
}

/** Signed links for files kept in the private project bucket. */
async function signPaths(paths: string[]) {
  if (paths.length === 0) return {} as Record<string, string>;
  const { data } = await supabase.storage.from("project-files").createSignedUrls(paths, 3600);
  return Object.fromEntries(
    (data ?? [])
      .map((item, index) => [paths[index], item.signedUrl] as const)
      .filter(([, url]) => Boolean(url)),
  ) as Record<string, string>;
}

export function useLibraryAssets(projectId: string | undefined, kind: "brand" | "module") {
  return useQuery({
    queryKey: ["library-assets", projectId, kind],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_assets")
        .select("*")
        .eq("project_id", projectId!)
        .eq("kind", kind)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const rows = data ?? [];
      const urls = await signPaths(
        Array.from(new Set(rows.flatMap((row) => [row.thumbnail_path, row.storage_path]).filter(Boolean))) as string[],
      );
      return rows.map((row) => ({
        ...row,
        previewUrl: urls[row.thumbnail_path ?? row.storage_path ?? ""] ?? null,
        fileUrl: row.storage_path ? (urls[row.storage_path] ?? null) : null,
      }));
    },
  });
}

export function useGuidelines(projectId: string | undefined) {
  return useQuery({
    queryKey: ["guidelines", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidelines")
        .select("*")
        .eq("project_id", projectId!)
        .order("position", { ascending: true });
      if (error) throw error;

      const rows = data ?? [];
      const urls = await signPaths(rows.map((row) => row.image_path).filter(Boolean) as string[]);
      return rows.map((row) => ({ ...row, imageUrl: urls[row.image_path ?? ""] ?? null }));
    },
  });
}

export function useDocuments(projectId: string | undefined) {
  return useQuery({
    queryKey: ["documents", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMeetings(projectId: string | undefined) {
  return useQuery({
    queryKey: ["meetings", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("project_id", projectId!)
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAssetRequests(projectId: string | undefined) {
  return useQuery({
    queryKey: ["asset-requests", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_requests")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
