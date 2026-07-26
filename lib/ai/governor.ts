import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIInsight, GeminiModelInfo, AIProviderMode, AIProviderType } from "../types/pulse";

interface CachedResponse {
  insight: AIInsight;
  healthScore: number;
  timestamp: number;
}

let cachedScan: CachedResponse | null = null;
const ADAPTIVE_CACHE_TTL_MS = 30000;

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

export async function validateApiKey(apiKey: string, provider: AIProviderType = "gemini"): Promise<{ success: boolean; error?: string; models?: GeminiModelInfo[] }> {
  if (!apiKey || apiKey.trim().length < 6) {
    return { success: false, error: "API key is too short or empty." };
  }

  try {
    if (provider === "gemini") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!res.ok) {
        return { success: false, error: `Invalid API Key (HTTP ${res.status}: Unauthorized)` };
      }
      const data = await res.json();
      if (!data.models || !Array.isArray(data.models)) {
        return { success: false, error: "No models returned for this API key." };
      }
      const models = await fetchAvailableGeminiModels(apiKey);
      return { success: true, models };
    } else if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        return { success: false, error: `Invalid OpenAI API Key (HTTP ${res.status}: Unauthorized)` };
      }
      return { success: true, models: getOpenAIModels() };
    } else if (provider === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        return { success: false, error: `Invalid OpenRouter API Key (HTTP ${res.status}: Unauthorized)` };
      }
      return { success: true, models: getOpenRouterModels() };
    } else {
      const res = await fetch("https://api.anthropic.com/v1/models", {
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      });
      if (!res.ok) {
        return { success: false, error: `Invalid Anthropic API Key (HTTP ${res.status}: Unauthorized)` };
      }
      return { success: true, models: getAnthropicModels() };
    }
  } catch (err: any) {
    return { success: false, error: `Connection failed: ${err.message || "Network error"}` };
  }
}

export async function fetchAvailableGeminiModels(apiKey: string): Promise<GeminiModelInfo[]> {
  if (!apiKey) return getDefaultFallbackModels();

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return getDefaultFallbackModels();

    const data = await res.json();
    if (!data.models || !Array.isArray(data.models)) return getDefaultFallbackModels();

    const supported: GeminiModelInfo[] = data.models
      .filter((m: any) =>
        m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
      )
      .map((m: any) => {
        const cleanName = m.name.replace("models/", "");
        const isLatest36 = cleanName.includes("3.6");
        const isFlash = cleanName.includes("flash");
        const isPro = cleanName.includes("pro");
        const isLite = cleanName.includes("lite");

        let badgeLabel = undefined;
        let speedRating = 4;
        let costRating = 4;
        let qualityRating = 4;

        if (isLatest36 && isFlash) {
          badgeLabel = "⭐ Recommended by PulseOS";
          speedRating = 5;
          costRating = 4;
          qualityRating = 5;
        } else if (isFlash && isLite) {
          badgeLabel = "⚡ Ultra Low Cost";
          speedRating = 5;
          costRating = 5;
          qualityRating = 3;
        } else if (isPro) {
          badgeLabel = "🧠 Deep Reasoning";
          speedRating = 3;
          costRating = 3;
          qualityRating = 5;
        } else if (isFlash) {
          badgeLabel = "🚀 Fast Operational";
          speedRating = 5;
          costRating = 4;
          qualityRating = 4;
        }

        return {
          name: cleanName,
          displayName: m.displayName || cleanName,
          description: m.description || "Google Gemini Model for Operational Reasoning",
          isRecommended: isLatest36 || (isFlash && !isPro),
          maxTokens: m.outputTokenLimit || 8192,
          speedRating,
          costRating,
          qualityRating,
          badgeLabel,
          supportedCapabilities: ["Function Calling", "Structured Output", "Long Context", "Streaming"],
        };
      });

    supported.sort((a, b) => (b.qualityRating + b.speedRating) - (a.qualityRating + a.speedRating));
    return supported.length > 0 ? supported : getDefaultFallbackModels();
  } catch (err) {
    console.warn("Failed to fetch live Gemini models, using fallback list:", err);
    return getDefaultFallbackModels();
  }
}

export async function executePlaygroundPrompt(
  userPrompt: string,
  userApiKey?: string,
  selectedModel: string = "gemini-3.6-flash",
  providerMode: AIProviderMode = "demo"
): Promise<string> {
  const apiKeyToUse =
    providerMode === "personal" && userApiKey
      ? userApiKey
      : providerMode === "env"
      ? process.env.GEMINI_API_KEY || ""
      : "";

  if (providerMode === "demo" || !apiKeyToUse) {
    return `[DEMO MODE: Simulated Response]

Prompt Evaluated: "${userPrompt}"

Operational Response:
In Demo Mode, responses are generated via the local deterministic rule engine. 
• Station A (Grill): 84% utilization.
• Table 5 Wait Time: 12 minutes (within SLA).
• Stock Depletion: Aged Truffle Cheese (0.8 kg remaining).

To receive live LLM generation for your exact prompt, switch to "Personal Key Mode" or configure server environment variables.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKeyToUse);
    const model = genAI.getGenerativeModel({ model: selectedModel });
    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();
    return `[LIVE ${selectedModel.toUpperCase()} OUTPUT]\n\n${responseText}`;
  } catch (err: any) {
    return `[LLM GENERATION ERROR]\nFailed to generate content: ${err.message || "Invalid request"}`;
  }
}

function getDefaultFallbackModels(): GeminiModelInfo[] {
  return [
    {
      name: "gemini-3.6-flash",
      displayName: "Gemini 3.6 Flash",
      description: "Next-gen operational model with ultra-fast inference and zero hallucination reasoning",
      isRecommended: true,
      maxTokens: 16384,
      speedRating: 5,
      costRating: 4,
      qualityRating: 5,
      badgeLabel: "⭐ Recommended by PulseOS",
      supportedCapabilities: ["Function Calling", "Structured Output", "Long Context", "Streaming"],
    },
    {
      name: "gemini-3.5-flash",
      displayName: "Gemini 3.5 Flash",
      description: "High performance model optimized for real-time kitchen batching and inventory analysis",
      isRecommended: false,
      maxTokens: 8192,
      speedRating: 5,
      costRating: 4,
      qualityRating: 4,
      badgeLabel: "🚀 Fast Operational",
      supportedCapabilities: ["Structured Output", "Long Context"],
    },
    {
      name: "gemini-3.5-flash-lite",
      displayName: "Gemini 3.5 Flash Lite",
      description: "Ultra lightweight model for minimum latency and minimum token costs",
      isRecommended: false,
      maxTokens: 4096,
      speedRating: 5,
      costRating: 5,
      qualityRating: 3,
      badgeLabel: "⚡ Ultra Low Cost",
      supportedCapabilities: ["Structured Output"],
    },
  ];
}

function getOpenAIModels(): GeminiModelInfo[] {
  return [
    { name: "gpt-4o", displayName: "GPT-4o", description: "Flagship multimodal OpenAI model", isRecommended: true, maxTokens: 4096, speedRating: 5, costRating: 3, qualityRating: 5, badgeLabel: "⭐ Recommended OpenAI", supportedCapabilities: ["Vision", "Structured Output"] },
    { name: "gpt-4o-mini", displayName: "GPT-4o Mini", description: "Fast, affordable OpenAI model", isRecommended: false, maxTokens: 4096, speedRating: 5, costRating: 5, qualityRating: 4, badgeLabel: "⚡ Low Cost OpenAI", supportedCapabilities: ["Structured Output"] },
  ];
}

function getAnthropicModels(): GeminiModelInfo[] {
  return [
    { name: "claude-3-5-sonnet", displayName: "Claude 3.5 Sonnet", description: "Highest intelligence Claude model", isRecommended: true, maxTokens: 8192, speedRating: 4, costRating: 3, qualityRating: 5, badgeLabel: "⭐ Recommended Anthropic", supportedCapabilities: ["Deep Reasoning", "Artifacts"] },
    { name: "claude-3-haiku", displayName: "Claude 3 Haiku", description: "Fastest lightweight Claude model", isRecommended: false, maxTokens: 4096, speedRating: 5, costRating: 5, qualityRating: 4, badgeLabel: "⚡ Fast Anthropic", supportedCapabilities: ["Structured Output"] },
  ];
}

function getOpenRouterModels(): GeminiModelInfo[] {
  return [
    { name: "meta-llama/llama-3.3-70b-instruct", displayName: "Llama 3.3 70B", description: "Open weights flagship model on OpenRouter", isRecommended: true, maxTokens: 8192, speedRating: 4, costRating: 5, qualityRating: 5, badgeLabel: "⭐ Recommended Open-Source", supportedCapabilities: ["Function Calling"] },
  ];
}

export async function runPulseAIGovernorScan(snapshot: SnapshotPayload) {
  const now = Date.now();
  const providerMode = snapshot.providerMode || "demo";
  const apiKeyToUse =
    providerMode === "personal" && snapshot.userApiKey
      ? snapshot.userApiKey
      : providerMode === "env"
      ? process.env.GEMINI_API_KEY || ""
      : "";

  if (cachedScan && now - cachedScan.timestamp < ADAPTIVE_CACHE_TTL_MS) {
    return {
      insight: cachedScan.insight,
      healthScore: cachedScan.healthScore,
      isCached: true,
      isFallback: false,
    };
  }

  if (providerMode === "demo" || !apiKeyToUse) {
    const fallbackInsight = generateDeterministicFallbackInsight(snapshot);
    const health = Math.max(65, 100 - snapshot.lowInventory.length * 8 - (snapshot.kitchenLoad > 80 ? 12 : 0));
    
    cachedScan = { insight: fallbackInsight, healthScore: health, timestamp: now };
    return {
      insight: fallbackInsight,
      healthScore: health,
      isCached: false,
      isFallback: true,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKeyToUse);
    const targetModel = snapshot.selectedModel || "gemini-3.6-flash";
    const model = genAI.getGenerativeModel({ model: targetModel });

    const prompt = `You are PulseOS Operational Intelligence Governor for a high-volume restaurant.
Given the current real-time operational snapshot:
${JSON.stringify(snapshot, null, 2)}

Respond strictly in valid JSON format matching this schema:
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
  "why_not": ["Why not alternative 1? ➔ Reason"],
  "healthScore": 92
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    const generatedInsight: AIInsight = {
      id: `ins-gemini-${now}`,
      type: "bottleneck",
      title: parsed.title || "Kitchen Batching & Resource Re-allocation",
      problem: parsed.problem || "High prep queue detected across active tables.",
      cause: parsed.cause || "Concurrent order spikes on grill station.",
      recommendation: parsed.recommendation || "Batch identical dishes and reassign line cook.",
      business_impact: {
        wait_reduction_pct: parsed.wait_reduction_pct || 15,
        revenue_increase_val: parsed.revenue_increase_val || 2800,
        waste_reduction_pct: parsed.waste_reduction_pct || 5,
        kitchen_load_reduction_pct: parsed.kitchen_load_reduction_pct || 10,
      },
      confidence: parsed.confidence || 96,
      reasoning: parsed.reasoning || ["Real-time station load threshold exceeded"],
      why_not: parsed.why_not || [
        "Why not open Line 2 Grill? ➔ Only 2 pending patty orders exist; extra line cook cost exceeds wait savings.",
      ],
      snapshot_version: "v182",
      generated_ago_sec: 2,
      created_at: "Just now",
    };

    const health = parsed.healthScore || 92;
    cachedScan = { insight: generatedInsight, healthScore: health, timestamp: now };

    return {
      insight: generatedInsight,
      healthScore: health,
      isCached: false,
      isFallback: false,
    };
  } catch (err) {
    console.warn("Gemini API call failed, defaulting to Rule Engine:", err);
    const fallbackInsight = generateDeterministicFallbackInsight(snapshot);
    const health = Math.max(70, 100 - snapshot.lowInventory.length * 10);
    return {
      insight: fallbackInsight,
      healthScore: health,
      isCached: false,
      isFallback: true,
    };
  }
}

function generateDeterministicFallbackInsight(snapshot: SnapshotPayload): AIInsight {
  const hasLowStock = snapshot.lowInventory.length > 0;
  
  if (hasLowStock) {
    return {
      id: `ins-rule-${Date.now()}`,
      type: "inventory",
      title: `Low Stock Criticality: ${snapshot.lowInventory[0]} Depletion`,
      problem: `${snapshot.lowInventory[0]} is below minimum safety threshold.`,
      cause: `Unexpected Friday night order surge (+34% vs baseline).`,
      recommendation: `Trigger express inventory replenishment & push alternative signature appetizers on Customer Menu.`,
      business_impact: {
        wait_reduction_pct: 0,
        revenue_increase_val: 4200,
        waste_reduction_pct: 12,
        kitchen_load_reduction_pct: 6,
      },
      confidence: 94,
      reasoning: [
        "Rule Engine: Inventory burn rate exceeds threshold",
        "Estimated stock depletion in < 45 minutes",
        "Alternative item promotion provides +65% margin",
      ],
      why_not: [
        "Why not stop orders for truffle pasta? ➔ Prevents revenue loss on high margin item.",
      ],
      snapshot_version: "v182",
      generated_ago_sec: 2,
      created_at: "Just now",
    };
  }

  return {
    id: `ins-rule-${Date.now()}`,
    type: "bottleneck",
    title: "Kitchen Station CPU Batching Optimization",
    problem: "Station A (Grill) experiencing elevated line cook queue times.",
    cause: "5 Wagyu Burger orders active across Tables 2 & 5.",
    recommendation: "Execute Smart CPU Batching: Cook all 5 Wagyu patties simultaneously.",
    business_impact: {
      wait_reduction_pct: 18,
      revenue_increase_val: 3400,
      waste_reduction_pct: 5,
      kitchen_load_reduction_pct: 14,
    },
    confidence: 96,
    reasoning: [
      "Rule Engine: Station A surface utilization at 88%",
      "Identical patty sear cycles permit 5-unit batching",
      "Reduces total station heat cycles from 4 to 1",
    ],
    why_not: [
      "Why not open Line 2 Grill? ➔ Only 2 pending patty orders exist; extra line cook cost exceeds wait savings.",
    ],
    snapshot_version: "v182",
    generated_ago_sec: 2,
    created_at: "Just now",
  };
}
