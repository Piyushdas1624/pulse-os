import { NextResponse } from "next/server";
import {
  defaultModel,
  generate,
  validateAndList,
  ProviderError,
} from "@/lib/ai/providers";
import {
  runPulseAIGovernorScan,
  runAdvisorChat,
  type SnapshotPayload,
} from "@/lib/ai/governor";
import type { AIProviderType, AIProviderMode } from "@/lib/types/pulse";

/**
 * One AI endpoint, four actions. The previous build only handled
 * validate_key / fetch_models / run_playground — triggerExecutiveAudit sends
 * no action, so every audit silently 400'd. Actions are now required and the
 * audit + chat paths route through the real provider abstraction.
 */

const provider = (v: unknown): AIProviderType =>
  v === "openai" || v === "anthropic" || v === "openrouter" ? v : "gemini";

const mode = (v: unknown): AIProviderMode =>
  v === "personal" || v === "env" ? v : "demo";

/** In env mode the key lives server-side; in personal it comes from the
 *  encrypted client vault via the request body. Demo never needs one. */
function resolveKey(type: AIProviderType, m: AIProviderMode, userApiKey?: string): string {
  if (m === "env") return process.env.GEMINI_API_KEY ?? "";
  if (m === "personal") return String(userApiKey ?? "");
  return "";
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const action = String(body.action ?? "");
  if (!action) {
    return NextResponse.json(
      { success: false, error: 'Missing "action". Expected validate_key | fetch_models | run_playground | run_audit | run_chat.' },
      { status: 400 }
    );
  }

  const type = provider(body.providerType);
  const m = mode(body.providerMode);

  try {
    // ---- key + model discovery --------------------------------------
    if (action === "validate_key" || action === "fetch_models") {
      // These actions test a key supplied in the body — the whole point is to
      // validate a DRAFT key the user has not committed to the store yet. So we
      // do NOT route through resolveKey/mode here (that would drop the key in
      // demo mode and always report "not validated"). Fall back to env only if
      // the caller explicitly asked for server-key mode with no body key.
      const bodyKey = String(body.userApiKey ?? "").trim();
      const key =
        bodyKey ||
        (m === "env" ? process.env.GEMINI_API_KEY ?? "" : "");
      if (!key.trim()) {
        return NextResponse.json(
          { success: false, error: "Enter an API key before validating." },
          { status: 400 }
        );
      }
      const result = await validateAndList(type, key);
      return NextResponse.json({ success: true, ...result });
    }

    // ---- free-form prompt -------------------------------------------
    if (action === "run_playground") {
      const userPrompt = String(body.userPrompt ?? "").trim();
      if (!userPrompt) {
        return NextResponse.json(
          { success: false, error: "Prompt is empty." },
          { status: 400 }
        );
      }
      if (m === "demo") {
        return NextResponse.json({
          success: true,
          response: "Demo mode is local and deterministic. Connect a provider key in Settings to run this prompt against a live model.",
          isFallback: true,
        });
      }
      const key = resolveKey(type, m, body.userApiKey);
      const model = String(body.selectedModel ?? defaultModel(type, []));
      const { text } = await generate(type, key, model, userPrompt);
      return NextResponse.json({ success: true, response: text });
    }

    // ---- executive operations audit ---------------------------------
    if (action === "run_audit") {
      const snapshot: SnapshotPayload = {
        activeOrdersCount: Number(body.activeOrdersCount ?? 0),
        tablesOccupied: Number(body.tablesOccupied ?? 0),
        kitchenLoad: Number(body.kitchenLoad ?? 0),
        lowInventory: Array.isArray(body.lowInventory) ? body.lowInventory.map(String) : [],
        providerType: type,
        providerMode: m,
        userApiKey: body.userApiKey,
        selectedModel: body.selectedModel,
      };
      const result = await runPulseAIGovernorScan(snapshot);
      return NextResponse.json({ success: true, ...result });
    }

    // ---- advisor chat -----------------------------------------------
    if (action === "run_chat") {
      const question = String(body.question ?? "").trim();
      if (!question) {
        return NextResponse.json(
          { success: false, error: "Question is empty." },
          { status: 400 }
        );
      }
      const snapshot: SnapshotPayload = {
        activeOrdersCount: Number(body.activeOrdersCount ?? 0),
        tablesOccupied: Number(body.tablesOccupied ?? 0),
        kitchenLoad: Number(body.kitchenLoad ?? 0),
        lowInventory: Array.isArray(body.lowInventory) ? body.lowInventory.map(String) : [],
        providerType: type,
        providerMode: m,
        userApiKey: body.userApiKey,
        selectedModel: body.selectedModel,
      };
      const result = await runAdvisorChat(question, snapshot);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action "${action}".` },
      { status: 400 }
    );
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.status >= 400 && err.status < 500 ? err.status : 502 }
      );
    }
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "AI request failed." },
      { status: 400 }
    );
  }
}
