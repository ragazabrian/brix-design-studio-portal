import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";

import { supabase } from "@/integrations/supabase/client";
import { defaultChatModel } from "@/lib/chat-models";

export type ChatThread = {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
};

export function useChatThreads(userId: string | undefined) {
  return useQuery({
    queryKey: ["chat-threads", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ChatThread[]> => {
      const { data, error } = await supabase
        .from("chat_threads")
        .select("id, title, model, created_at, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useChatThread(threadId: string | undefined) {
  return useQuery({
    queryKey: ["chat-thread", threadId],
    enabled: Boolean(threadId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_threads")
        .select("id, title, model, created_at, updated_at")
        .eq("id", threadId!)
        .maybeSingle();
      if (error) throw error;
      return data as ChatThread | null;
    },
  });
}

/** Stored rows come back in the shape the chat UI already understands. */
export function useChatMessages(threadId: string | undefined) {
  return useQuery({
    queryKey: ["chat-messages", threadId],
    enabled: Boolean(threadId),
    queryFn: async (): Promise<UIMessage[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, parts, content, created_at")
        .eq("thread_id", threadId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => {
        const parts = Array.isArray(row.parts) ? row.parts : [];
        return {
          id: row.id,
          role: row.role as UIMessage["role"],
          parts: (parts.length > 0
            ? parts
            : [{ type: "text", text: row.content }]) as UIMessage["parts"],
        } satisfies UIMessage;
      });
    },
  });
}

export function useCreateChatThread(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (model?: string) => {
      const { data, error } = await supabase
        .from("chat_threads")
        .insert({ user_id: userId!, model: model ?? defaultChatModel })
        .select("id, title, model, created_at, updated_at")
        .single();
      if (error) throw error;
      return data as ChatThread;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["chat-threads", userId] });
    },
  });
}

export function useDeleteChatThread(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      const { error } = await supabase.from("chat_threads").delete().eq("id", threadId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["chat-threads", userId] });
    },
  });
}
