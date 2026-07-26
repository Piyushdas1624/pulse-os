import { NextResponse } from "next/server";
import { defaultModel, generate, validateAndList, listProviderModels } from "@/lib/ai/providers";
import type { AIProviderType } from "@/lib/types/pulse";

const provider = (v: unknown): AIProviderType =>
  v === "openai" || v === "anthropic" || v === "openrouter" ? v : "gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = provider(body.providerType);
    const key = String(body.userApiKey ?? (type === "gemini" ? process.env.GEMINI_API_KEY : ""));

    if (body.action === "validate_key" || body.action === "fetch_models") {
      const result = await validateAndList(type, key);
      return NextResponse.json({ success: true, ...result });
    }

    if (body.action === "run_playground") {
      if (body.providerMode === "demo") {
        return NextResponse.json({ success: true, response: "Demo mode is local and deterministic. Connect a provider key to run this prompt against a live model." });
      }
      const response = await generate(type, key, String(body.selectedModel), String(body.userPrompt));
      return NextResponse.json({ success: true, response });
    }

    return NextResponse.json({ success: false, error: "Unknown AI action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "AI request failed" }, { status: 400 });
  }
}
