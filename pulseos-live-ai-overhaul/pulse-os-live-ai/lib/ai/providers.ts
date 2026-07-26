import type { AIProviderType, GeminiModelInfo } from "@/lib/types/pulse";

type ProviderModel = GeminiModelInfo & { provider: AIProviderType };

const headers = (provider: AIProviderType, key: string): Record<string, string> => {
  if (provider === "anthropic") return { "x-api-key": key, "anthropic-version": "2023-06-01" };
  if (provider === "openrouter") return { Authorization: `Bearer ${key}`, "HTTP-Referer": "https://pulse-os.local" };
  return { Authorization: `Bearer ${key}` };
};

const textModel = (provider: AIProviderType, m: any): ProviderModel => {
  const name = String(m.name ?? m.id ?? "").replace(/^models\//, "");
  const flash = /flash|mini|haiku|small|lite/i.test(name);
  const pro = /pro|opus|sonnet|gpt-4o/i.test(name);
  return {
    provider,
    name,
    displayName: m.displayName ?? m.name ?? m.id ?? name,
    description: m.description ?? `${provider} model available to this key`,
    isRecommended: /gemini-3\.6-flash/i.test(name) || (!pro && flash),
    maxTokens: m.outputTokenLimit ?? m.max_tokens ?? 8192,
    speedRating: flash ? 5 : 4,
    costRating: /mini|lite|haiku|flash/i.test(name) ? 5 : 3,
    qualityRating: pro ? 5 : 4,
    badgeLabel: /gemini-3\.6-flash/i.test(name) ? "Recommended" : undefined,
    supportedCapabilities: ["Text generation"],
  };
};

export async function listProviderModels(provider: AIProviderType, key: string): Promise<ProviderModel[]> {
  if (!key.trim()) throw new Error("API key is required");
  let res: Response;
  if (provider === "gemini") {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`, { cache: "no-store" });
  } else if (provider === "openai") {
    res = await fetch("https://api.openai.com/v1/models", { headers: headers(provider, key), cache: "no-store" });
  } else if (provider === "anthropic") {
    res = await fetch("https://api.anthropic.com/v1/models", { headers: headers(provider, key), cache: "no-store" });
  } else {
    res = await fetch("https://openrouter.ai/api/v1/models", { headers: headers(provider, key), cache: "no-store" });
  }
  if (!res.ok) throw new Error(`${provider} rejected the key (HTTP ${res.status})`);
  const data = await res.json();
  const raw = Array.isArray(data.models) ? data.models : Array.isArray(data.data) ? data.data : [];
  const models = raw
    .filter((m: any) => provider !== "gemini" || m.supportedGenerationMethods?.includes("generateContent"))
    .map((m: any) => textModel(provider, m))
    .filter((m: ProviderModel) => m.name && !/embedding|moderation|audio|image|whisper|tts/i.test(m.name));
  if (!models.length) throw new Error("The key is valid, but no text-generation models were returned");
  return models.sort((a, b) => Number(b.isRecommended) - Number(a.isRecommended));
}

export function defaultModel(provider: AIProviderType, models: ProviderModel[]): string {
  if (provider === "gemini" && models.some((m) => m.name === "gemini-3.6-flash")) return "gemini-3.6-flash";
  return models.find((m) => m.isRecommended)?.name ?? models[0]?.name ?? "";
}

export async function validateAndList(provider: AIProviderType, key: string) {
  const models = await listProviderModels(provider, key);
  return { models, selectedModel: defaultModel(provider, models) };
}

export async function generate(provider: AIProviderType, key: string, model: string, prompt: string): Promise<string> {
  if (provider === "gemini") {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message ?? `Gemini error ${r.status}`);
    return d.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "The model returned no text.";
  }
  if (provider === "anthropic") {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { ...headers(provider, key), "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 1200, messages: [{ role: "user", content: prompt }] }),
    });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message ?? `Anthropic error ${r.status}`);
    return d.content?.map((p: any) => p.text).join("") ?? "The model returned no text.";
  }
  const url = provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const r = await fetch(url, { method: "POST", headers: { ...headers(provider, key), "Content-Type": "application/json" }, body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error?.message ?? `${provider} error ${r.status}`);
  return d.choices?.[0]?.message?.content ?? "The model returned no text.";
}
