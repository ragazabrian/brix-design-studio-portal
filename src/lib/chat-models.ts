/** Models the portal assistant can run. Client safe: no keys, no server imports. */
export type ChatModel = {
  id: string;
  label: string;
  note: string;
  /** OpenAI models run through the gateway Responses API. */
  responses: boolean;
};

export const chatModels: ChatModel[] = [
  {
    id: "google/gemini-3.7-flash",
    label: "Gemini 3.7 Flash",
    note: "Balanced default, quick replies",
    responses: false,
  },
  {
    id: "google/gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    note: "Fast general purpose",
    responses: false,
  },
  {
    id: "google/gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    note: "Fast general purpose",
    responses: false,
  },
  {
    id: "google/gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    note: "Cheapest, best for short tasks",
    responses: false,
  },
  {
    id: "google/gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro",
    note: "Deeper reasoning, slower",
    responses: false,
  },
  {
    id: "google/gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    note: "Long context and analysis",
    responses: false,
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    note: "Steady, lower cost",
    responses: false,
  },
  {
    id: "openai/gpt-5.6-terra",
    label: "GPT-5.6 Terra",
    note: "Everyday writing and thinking",
    responses: true,
  },
  {
    id: "openai/gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    note: "Fast and low cost",
    responses: true,
  },
  {
    id: "openai/gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    note: "Strongest for hard problems",
    responses: true,
  },
  {
    id: "openai/gpt-5.5",
    label: "GPT-5.5",
    note: "Frontier reasoning and coding",
    responses: true,
  },
  {
    id: "openai/gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    note: "Good balance of speed and depth",
    responses: true,
  },
  {
    id: "openai/chat-latest",
    label: "ChatGPT model",
    note: "Conversational, no thinking step",
    responses: true,
  },
];

export const defaultChatModel = chatModels[0]!.id;

export function findChatModel(id: string | null | undefined): ChatModel {
  return chatModels.find((model) => model.id === id) ?? chatModels[0]!;
}
