/** Models the portal assistant can run. Client safe: no keys, no server imports. */
export type ChatModel = {
  id: string;
  label: string;
  note: string;
  /** Reasoning models run through OpenAI's Responses API. */
  responses: boolean;
};

// Verify these ids against the OpenAI account tied to OPENAI_API_KEY before
// shipping — model availability changes over time.
export const chatModels: ChatModel[] = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    note: "Fast and low cost, conversational, no thinking step",
    responses: false,
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    note: "Everyday writing and thinking",
    responses: false,
  },
  {
    id: "o3-mini",
    label: "o3-mini",
    note: "Reasoning for harder problems",
    responses: true,
  },
  {
    id: "o1",
    label: "o1",
    note: "Strongest reasoning, slower",
    responses: true,
  },
];

export const defaultChatModel = chatModels[0]!.id;

export function findChatModel(id: string | null | undefined): ChatModel {
  return chatModels.find((model) => model.id === id) ?? chatModels[0]!;
}
