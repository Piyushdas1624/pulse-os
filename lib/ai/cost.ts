import type { AIProviderType } from "@/lib/types/pulse";
import type { TokenUsage } from "./providers";

/**
 * cost — rupee estimation for AI requests.
 *
 * HONEST LIMITATION: providers do not bill in rupees and the rate table below
 * is an approximation of mid-2026 list prices (USD/1M tokens → INR at ~₹84).
 * Anything shown in the UI derived from this MUST be labelled "estimated".
 * It exists so "today spend" is not permanently zero on a real key — it moves
 * with real token usage, which is the part that matters operationally.
 */

const USD_TO_INR = 84;

interface Rate {
  in: number; // USD per 1M input tokens
  out: number; // USD per 1M output tokens
}

// Pattern-match on model id, most specific first. Flash/mini/haiku families
// are cheapest; pro/opus/4o are the expensive tier. Anything unmatched falls
// back to a conservative mid-range rate so we never show ₹0 on a real call.
const TABLE: { match: RegExp; gemini?: Rate; openai?: Rate; anthropic?: Rate; openrouter?: Rate }[] = [
  { match: /flash/i, gemini: { in: 0.30, out: 2.50 } },
  { match: /flash-lite|flash.*lite/i, gemini: { in: 0.10, out: 0.40 } },
  { match: /-pro$|pro-/i, gemini: { in: 1.25, out: 10.00 } },
  { match: /4o-mini|gpt-4o-mini/i, openai: { in: 0.15, out: 0.60 } },
  { match: /gpt-4o/i, openai: { in: 2.50, out: 10.00 } },
  { match: /gpt-4.1/i, openai: { in: 2.00, out: 8.00 } },
  { match: /o1-mini|o3-mini/i, openai: { in: 1.10, out: 4.40 } },
  { match: /o1|o3/i, openai: { in: 15.00, out: 60.00 } },
  { match: /haiku/i, anthropic: { in: 0.80, out: 4.00 } },
  { match: /sonnet/i, anthropic: { in: 3.00, out: 15.00 } },
  { match: /opus/i, anthropic: { in: 15.00, out: 75.00 } },
  { match: /llama/i, openrouter: { in: 0.20, out: 0.60 } },
  { match: /mistral|mixtral/i, openrouter: { in: 0.25, out: 0.50 } },
];

// Conservative fallbacks so an unknown model never reads as free.
const FALLBACK: Record<AIProviderType, Rate> = {
  gemini: { in: 0.35, out: 1.50 },
  openai: { in: 1.50, out: 6.00 },
  anthropic: { in: 3.00, out: 15.00 },
  openrouter: { in: 0.60, out: 0.90 },
};

function rateFor(provider: AIProviderType, model: string): Rate {
  for (const row of TABLE) {
    if (row.match.test(model) && row[provider]) return row[provider]!;
  }
  return FALLBACK[provider];
}

/** Estimated rupee cost for a single request. Rounds to the nearest paisa. */
export function estimateCostInr(
  provider: AIProviderType,
  model: string,
  usage: TokenUsage
): number {
  const r = rateFor(provider, model);
  const usd =
    (usage.inputTokens / 1_000_000) * r.in +
    (usage.outputTokens / 1_000_000) * r.out;
  return Math.round(usd * USD_TO_INR * 100) / 100;
}
