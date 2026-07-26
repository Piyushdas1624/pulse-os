import { NextResponse } from "next/server";
import { runPulseAIGovernorScan, fetchAvailableGeminiModels, validateApiKey, executePlaygroundPrompt } from "@/lib/ai/governor";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Action: Validate Key
    if (body.action === "validate_key") {
      const { userApiKey, providerType = "gemini" } = body;
      const validation = await validateApiKey(userApiKey, providerType);
      return NextResponse.json(validation);
    }

    // 2. Action: Fetch Live Models
    if (body.action === "fetch_models") {
      const apiKey = body.userApiKey || process.env.GEMINI_API_KEY || "";
      const models = await fetchAvailableGeminiModels(apiKey);
      return NextResponse.json({ success: true, models });
    }

    // 3. Action: Run Playground Prompt
    if (body.action === "run_playground") {
      const { userPrompt, userApiKey, selectedModel, providerMode } = body;
      const response = await executePlaygroundPrompt(userPrompt, userApiKey, selectedModel, providerMode);
      return NextResponse.json({ success: true, response });
    }

    // 4. Action: Executive Audit Scan
    const {
      activeOrdersCount = 0,
      tablesOccupied = 0,
      kitchenLoad = 80,
      lowInventory = [],
      providerMode = "demo",
      userApiKey = "",
      selectedModel = "gemini-3.6-flash",
    } = body;

    const result = await runPulseAIGovernorScan({
      activeOrdersCount,
      tablesOccupied,
      kitchenLoad,
      lowInventory,
      providerMode,
      userApiKey,
      selectedModel,
    });

    return NextResponse.json({
      success: true,
      insight: result.insight,
      healthScore: result.healthScore,
      isCached: result.isCached,
      isFallback: result.isFallback,
    });
  } catch (error) {
    console.error("Health Scan API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute Executive Operations Audit" },
      { status: 500 }
    );
  }
}
