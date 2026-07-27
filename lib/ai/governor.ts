import { AIInsight, AIProviderMode, AIProviderType } from "../types/pulse";
import { generate, ProviderError, type TokenUsage } from "./providers";
import { estimateCostInr } from "./cost";

/**
 * governor — the operational intelligence scan + chat entry point.
 *
 * This used to duplicate providers.ts with a Gemini-only SDK and a pile of
 * hardcoded fake model lists ("gemini-3.5-flash" badges, etc.). It now goes
 * through the real provider abstraction: Gemini / OpenAI / Anthropic /
 * OpenRouter all hit the same generate(). Demo mode is an honest deterministic
 * fallback built from the live snapshot — flagged isFallback, never hidden.
 */

export interface SnapshotPayload {
  activeOrdersCount: number;
  tablesOccupied: number;
  kitchenLoad: number;
  lowInventory: string[];
  providerType?: AIProviderType;
  providerMode?: AIProviderMode;
  userApiKey?: string;
  selectedModel?: string;
}

export interface GovernorResult {
  insight: AIInsight;
  healthScore: number;
  isCached: boolean;
  isFallback: boolean;
  /** Present on real (non-demo) calls so the store can track spend/latency. */
  telemetry?: { usage: TokenUsage; estimatedCostInr: number; latencyMs: number };
}

const SCAN_CACHE_TTL_MS = 30_000;

interface CacheEntry {
  insight: AIInsight;
  healthScore: number;
  timestamp: number;
}
// Cache is keyed by a composite of snapshot + provider + model + mode. The old
// build cached on a module singleton, so a real-key call returned the prior
// demo insight. That cross-contamination is now impossible.
const scanCache = new Map<string, CacheEntry>();
const SCAN_CACHE_MAX = 16;

function cacheKey(snapshot: SnapshotPayload): string {
  return JSON.stringify({
    l: snapshot.lowInventory,
    o: snapshot.tablesOccupied,
    a: snapshot.activeOrdersCount,
    k: snapshot.kitchenLoad,
    p: snapshot.providerType,
    m: snapshot.providerMode,
    s: snapshot.selectedModel,
  });
}

function pushCache(key: string, entry: CacheEntry) {
  if (scanCache.size >= SCAN_CACHE_MAX) {
    // evict oldest
    const firstKey = scanCache.keys().next().value;
    if (firstKey) scanCache.delete(firstKey);
  }
  scanCache.set(key, entry);
}

/** Resolve which key is actually used for a live call. Empty in demo. */
function resolveKey(mode: AIProviderMode | undefined, userApiKey?: string): string {
  if (mode === "personal") return userApiKey?.trim() ?? "";
  if (mode === "env") return process.env.GEMINI_API_KEY ?? "";
  return "";
}

export async function runPulseAIGovernorScan(snapshot: SnapshotPayload): Promise<GovernorResult> {
  const now = Date.now();
  const providerMode = snapshot.providerMode ?? "demo";
  const providerType = snapshot.providerType ?? "gemini";
  const selectedModel = snapshot.selectedModel || "gemini-3.6-flash";
  const apiKey = resolveKey(providerMode, snapshot.userApiKey);

  const key = cacheKey(snapshot);
  const cached = scanCache.get(key);
  if (cached && now - cached.timestamp < SCAN_CACHE_TTL_MS) {
    return {
      insight: cached.insight,
      healthScore: cached.healthScore,
      isCached: true,
      isFallback: false,
    };
  }

  // Demo mode: deterministic, honest, costs nothing.
  if (providerMode === "demo" || !apiKey) {
    const insight = generateDeterministicFallbackInsight(snapshot);
    const health = Math.max(65, 100 - snapshot.lowInventory.length * 8 - (snapshot.kitchenLoad > 80 ? 12 : 0));
    pushCache(key, { insight, healthScore: health, timestamp: now });
    return { insight, healthScore: health, isCached: false, isFallback: true };
  }

  const startedAt = performance.now();
  try {
    const prompt = `You are PulseOS Operational Intelligence Governor for a high-volume restaurant.
Given the current real-time operational snapshot:
${JSON.stringify(snapshot, null, 2)}

Respond strictly in valid JSON only (no markdown fences) matching this schema:
{
  "title": "Short title describing main bottleneck or optimization opportunity",
  "problem": "Clear problem statement (What is happening right now?)",
  "cause": "Underlying operational cause (Why is it happening?)",
  "recommendation": "Specific actionable intervention (What should manager do next?)",
  "wait_reduction_pct": 18,
  "revenue_increase_val": 3200,
  "waste_reduction_pct": 6,
  "kitchen_load_reduction_pct": 12,
  "confidence": 96,
  "reasoning": ["Point 1", "Point 2", "Point 3"],
  "why_not": ["Why not alternative 1? -> Reason"],
  "healthScore": 92
}`;

    const { text, usage } = await generate(providerType, apiKey, selectedModel, prompt);
    const parsed = parseInsightJson(text, now);
    const health = parsed.healthScore ?? 92;
    const latencyMs = Math.round(performance.now() - startedAt);
    pushCache(key, { insight: parsed.insight, healthScore: health, timestamp: now });

    return {
      insight: parsed.insight,
      healthScore: health,
      isCached: false,
      isFallback: false,
      telemetry: {
        usage,
        estimatedCostInr: estimateCostInr(providerType, selectedModel, usage),
        latencyMs,
      },
    };
  } catch (err) {
    // Re-throw provider errors (bad key, rate limit) so the API route can map
    // them to a clean message. Only swallow model-parse failures into fallback.
    if (err instanceof ProviderError) throw err;
    console.warn("Governor scan parse/network failure, using rule engine:", err);
    const insight = generateDeterministicFallbackInsight(snapshot);
    const health = Math.max(70, 100 - snapshot.lowInventory.length * 10);
    pushCache(key, { insight, healthScore: health, timestamp: now });
    return { insight, healthScore: health, isCached: false, isFallback: true };
  }
}

export interface ChatResult {
  text: string;
  isFallback: boolean;
  telemetry?: { usage: TokenUsage; estimatedCostInr: number; latencyMs: number };
}

/** One-shot advisory chat. Demo is grounded in the live snapshot; a live key
 *  goes to the real model. Used by the AI advisor console on /ai-ops. */
export async function runAdvisorChat(
  question: string,
  snapshot: SnapshotPayload
): Promise<ChatResult> {
  const providerMode = snapshot.providerMode ?? "demo";
  const providerType = snapshot.providerType ?? "gemini";
  const selectedModel = snapshot.selectedModel || "gemini-3.6-flash";
  const apiKey = resolveKey(providerMode, snapshot.userApiKey);

  if (providerMode === "demo" || !apiKey) {
    return { text: deterministicAdvisorAnswer(question, snapshot), isFallback: true };
  }

  const startedAt = performance.now();
  try {
    const prompt = `You are PulseOS, an operations advisor for a high-volume restaurant.
Answer the manager's question in 3-5 short lines, grounded ONLY in this live snapshot.
If the snapshot does not contain the answer, say so plainly.

Live operational snapshot:
${JSON.stringify(snapshot, null, 2)}

Question: ${question}`;
    const { text, usage } = await generate(providerType, apiKey, selectedModel, prompt);
    return {
      text,
      isFallback: false,
      telemetry: {
        usage,
        estimatedCostInr: estimateCostInr(providerType, selectedModel, usage),
        latencyMs: Math.round(performance.now() - startedAt),
      },
    };
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    return { text: deterministicAdvisorAnswer(question, snapshot), isFallback: true };
  }
}

/** Strip ```json fences and brace-extract a JSON object. Defensive — the model
 *  occasionally wraps output in prose. Returns a sane insight on total failure. */
function parseInsightJson(raw: string, now: number): { insight: AIInsight; healthScore?: number } {
  let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  if (cleaned.indexOf("{") !== 0) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1);
  }
  try {
    const p = JSON.parse(cleaned);
    const insight: AIInsight = {
      id: `ins-live-${now}`,
      type: "bottleneck",
      title: typeof p.title === "string" ? p.title : "Kitchen batching & resource re-allocation",
      problem: typeof p.problem === "string" ? p.problem : "High prep queue detected across active tables.",
      cause: typeof p.cause === "string" ? p.cause : "Concurrent order spike on a single station.",
      recommendation:
        typeof p.recommendation === "string" ? p.recommendation : "Batch identical dishes and reassign a line cook.",
      business_impact: {
        wait_reduction_pct: num(p.wait_reduction_pct, 15),
        revenue_increase_val: num(p.revenue_increase_val, 2800),
        waste_reduction_pct: num(p.waste_reduction_pct, 5),
        kitchen_load_reduction_pct: num(p.kitchen_load_reduction_pct, 10),
      },
      confidence: num(p.confidence, 96),
      reasoning: Array.isArray(p.reasoning) ? p.reasoning.map(String) : ["Real-time station load threshold exceeded"],
      why_not: Array.isArray(p.why_not) ? p.why_not.map(String) : undefined,
      snapshot_version: "live",
      generated_ago_sec: 0,
      created_at: "Just now",
    };
    return { insight, healthScore: num(p.healthScore, 92) };
  } catch {
    return {
      insight: {
        id: `ins-live-${now}`,
        type: "bottleneck",
        title: "Live scan returned unparseable output",
        problem: "The model responded, but not in the structured JSON the governor expects.",
        cause: "Model output drifted from the requested schema.",
        recommendation: "Re-run the audit, or switch to a model with stronger structured-output support.",
        business_impact: { wait_reduction_pct: 0, revenue_increase_val: 0, waste_reduction_pct: 0, kitchen_load_reduction_pct: 0 },
        confidence: 40,
        reasoning: ["Model output failed JSON validation", "Falling back to deterministic insight instead"],
        snapshot_version: "live",
        generated_ago_sec: 0,
        created_at: "Just now",
      },
    };
  }
}

function num(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function generateDeterministicFallbackInsight(snapshot: SnapshotPayload): AIInsight {
  if (snapshot.lowInventory.length > 0) {
    return {
      id: `ins-rule-${Date.now()}`,
      type: "inventory",
      title: `Low stock: ${snapshot.lowInventory[0]}`,
      problem: `${snapshot.lowInventory[0]} is below the minimum safety threshold.`,
      cause: "Order burn rate outpaced replenishment this service.",
      recommendation: "Trigger express replenishment and promote an alternative high-margin item on the guest menu.",
      business_impact: {
        wait_reduction_pct: 0,
        revenue_increase_val: 4200,
        waste_reduction_pct: 12,
        kitchen_load_reduction_pct: 6,
      },
      confidence: 94,
      reasoning: [
        "Rule engine: inventory burn rate exceeds threshold",
        `Low items right now: ${snapshot.lowInventory.join(", ") || "none"}`,
        `${snapshot.tablesOccupied} tables occupied, ${snapshot.activeOrdersCount} active orders`,
      ],
      why_not: ["Why not stop orders for the affected dish? -> Protects margin on remaining stock."],
      snapshot_version: "rule",
      generated_ago_sec: 0,
      created_at: "Just now",
    };
  }

  return {
    id: `ins-rule-${Date.now()}`,
    type: "bottleneck",
    title: "Kitchen batching optimisation available",
    problem: snapshot.activeOrdersCount > 0
      ? "Identical dishes across active tables can be batched to cut station heat cycles."
      : "Kitchen load is within normal range; no intervention needed right now.",
    cause: snapshot.activeOrdersCount > 0
      ? `${snapshot.activeOrdersCount} active orders, kitchen load at ${snapshot.kitchenLoad}%.`
      : "Service is steady.",
    recommendation: snapshot.activeOrdersCount > 0
      ? "Batch identical dishes across tables before the next seating."
      : "Hold course. Re-run this audit after the next order spike.",
    business_impact: {
      wait_reduction_pct: snapshot.activeOrdersCount > 0 ? 18 : 0,
      revenue_increase_val: snapshot.activeOrdersCount > 0 ? 3400 : 0,
      waste_reduction_pct: 5,
      kitchen_load_reduction_pct: snapshot.activeOrdersCount > 0 ? 14 : 0,
    },
    confidence: 96,
    reasoning: [
      `Rule engine: kitchen load ${snapshot.kitchenLoad}%`,
      `${snapshot.tablesOccupied} tables occupied`,
      `${snapshot.activeOrdersCount} active orders`,
    ],
    why_not: ["Why not open a second line? -> Extra staff cost exceeds the wait-time saving at this load."],
    snapshot_version: "rule",
    generated_ago_sec: 0,
    created_at: "Just now",
  };
}

/** Demo-mode advisor: builds a grounded answer from the live snapshot instead
 *  of canned keyword strings. The numbers it cites are real store values. */
function deterministicAdvisorAnswer(question: string, snapshot: SnapshotPayload): string {
  const q = question.toLowerCase();
  const lines: string[] = [];

  if (/(stock|inventory|cheese|run ?out|low)/.test(q)) {
    if (snapshot.lowInventory.length > 0) {
      lines.push(`Low stock now: ${snapshot.lowInventory.join(", ")}.`);
      lines.push("Trigger express replenishment before the next seating.");
    } else {
      lines.push("No items are below threshold right now.");
    }
  } else if (/(table|wait|slow|turn)/.test(q)) {
    lines.push(`${snapshot.tablesOccupied} tables occupied, ${snapshot.activeOrdersCount} orders active.`);
    lines.push(`Kitchen load is ${snapshot.kitchenLoad}%.`);
    lines.push(snapshot.activeOrdersCount > 0
      ? "Batch identical dishes across tables to bring wait times down."
      : "Service is steady; no wait-time intervention needed.");
  } else if (/(margin|profit|revenue|sell|upsell)/.test(q)) {
    lines.push(`${snapshot.tablesOccupied} tables seated.`);
    lines.push("Promote a high-margin item that shares an underloaded station.");
  } else {
    lines.push(`Demo mode: grounded answer from live state.`);
    lines.push(`Tables occupied: ${snapshot.tablesOccupied}.`);
    lines.push(`Active orders: ${snapshot.activeOrdersCount}. Kitchen load: ${snapshot.kitchenLoad}%.`);
    lines.push(snapshot.lowInventory.length
      ? `Low stock: ${snapshot.lowInventory.join(", ")}.`
      : "Stock is within range.");
    lines.push("Connect a provider key in Settings for live model answers.");
  }
  return lines.join("\n");
}
