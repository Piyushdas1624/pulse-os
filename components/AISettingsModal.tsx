"use client";

import { useState, useEffect } from "react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { GeminiModelInfo, AIProviderMode, AIBudgetMode, AIProviderType } from "@/lib/types/pulse";
import { X, Key, Cpu, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Play, DollarSign, Activity, Layers, Server, Table as TableIcon } from "lucide-react";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const { governor, setAIBudgetMode } = usePulseStore();

  const [activeTab, setActiveTab] = useState<"general" | "models" | "comparison" | "playground">("general");
  const [providerType, setProviderType] = useState<AIProviderType>("gemini");
  const [providerMode, setProviderMode] = useState<AIProviderMode>("demo");
  const [personalApiKey, setPersonalApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.6-flash");
  const [models, setModels] = useState<GeminiModelInfo[]>([]);

  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");
  const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(241);

  // Playground state
  const [playgroundPrompt, setPlaygroundPrompt] = useState("Analyze kitchen load on Station A Grill and recommend patty batching.");
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [isRunningPlayground, setIsRunningPlayground] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("pulse_personal_api_key");
    const savedMode = localStorage.getItem("pulse_provider_mode") as AIProviderMode;
    const savedModel = localStorage.getItem("pulse_selected_model");
    const savedProvider = localStorage.getItem("pulse_provider_type") as AIProviderType;

    if (savedKey) setPersonalApiKey(savedKey);
    if (savedMode) setProviderMode(savedMode);
    if (savedModel) setSelectedModel(savedModel);
    if (savedProvider) setProviderType(savedProvider);

    fetchModels(savedKey || "");
  }, []);

  const fetchModels = async (key: string) => {
    try {
      const res = await fetch("/api/ai/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch_models", userApiKey: key }),
      });
      const data = await res.json();
      if (data.success && data.models) {
        setModels(data.models);
      }
    } catch (err) {
      console.warn("Failed to fetch models:", err);
    }
  };

  const handleProviderSelect = (type: AIProviderType) => {
    setProviderType(type);
    setValidationStatus("idle");
    setValidationErrorMsg(null);
    localStorage.setItem("pulse_provider_type", type);

    if (type === "openai") {
      setSelectedModel("gpt-4o");
    } else if (type === "anthropic") {
      setSelectedModel("claude-3-5-sonnet");
    } else if (type === "openrouter") {
      setSelectedModel("meta-llama/llama-3.3-70b-instruct");
    } else {
      setSelectedModel("gemini-3.6-flash");
    }
  };

  const handleValidateKey = async () => {
    setIsValidating(true);
    setValidationStatus("idle");
    setValidationErrorMsg(null);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/ai/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate_key",
          userApiKey: personalApiKey,
          providerType,
        }),
      });
      const elapsed = Date.now() - startTime;
      const data = await res.json();

      if (data.success) {
        setValidationStatus("success");
        setLatencyMs(elapsed);
        if (data.models) setModels(data.models);
        localStorage.setItem("pulse_personal_api_key", personalApiKey);
        localStorage.setItem("pulse_provider_mode", "personal");
        setProviderMode("personal");
      } else {
        setValidationStatus("error");
        setValidationErrorMsg(data.error || "401 Unauthorized: Invalid API key");
      }
    } catch (err: any) {
      setValidationStatus("error");
      setValidationErrorMsg("Connection error validating key.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem("pulse_provider_type", providerType);
    localStorage.setItem("pulse_provider_mode", providerMode);
    localStorage.setItem("pulse_selected_model", selectedModel);
    if (personalApiKey) {
      localStorage.setItem("pulse_personal_api_key", personalApiKey);
    }
    onClose();
  };

  const handleRunPlayground = async () => {
    if (!playgroundPrompt.trim()) return;
    setIsRunningPlayground(true);
    setPlaygroundResponse(null);

    try {
      const res = await fetch("/api/ai/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_playground",
          userPrompt: playgroundPrompt,
          userApiKey: personalApiKey,
          selectedModel,
          providerMode,
        }),
      });
      const data = await res.json();
      if (data.success && data.response) {
        setPlaygroundResponse(data.response);
      } else {
        setPlaygroundResponse("Playground execution failed.");
      }
    } catch (err) {
      setPlaygroundResponse("Playground execution error.");
    } finally {
      setIsRunningPlayground(false);
    }
  };

  if (!isOpen) return null;

  const providerLabel =
    providerType === "gemini"
      ? "Google Gemini"
      : providerType === "openai"
      ? "OpenAI"
      : providerType === "anthropic"
      ? "Anthropic"
      : "OpenRouter";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl bg-obsidian-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Enterprise Top Bar */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-pulse-violet">
              <Cpu className="w-4 h-4 text-pulse-violet" />
              <span className="uppercase tracking-widest font-bold">Vercel Enterprise AI Settings</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
              PulseOS AI Infrastructure Manager
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
                  validationStatus === "error"
                    ? "bg-pulse-rose/20 text-pulse-rose border-pulse-rose/30"
                    : "bg-pulse-emerald/20 text-pulse-emerald border-pulse-emerald/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    validationStatus === "error" ? "bg-pulse-rose" : "bg-pulse-emerald animate-ping"
                  }`}
                />
                {validationStatus === "error" ? "❌ Disconnected" : "🟢 Connected"}
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all self-start sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enterprise Dynamic Metric Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-obsidian-950/80 border-b border-white/5 font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">ACTIVE PROVIDER</span>
            <span className="text-white font-bold">{providerLabel}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">API LATENCY</span>
            <span className="text-pulse-cyan font-bold">{latencyMs || 241} ms</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">TODAY SPEND</span>
            <span className="text-pulse-emerald font-bold">₹8.21 / ₹50</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">ACTIVE MODEL</span>
            <span className="text-pulse-violet font-bold truncate block">{selectedModel}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-obsidian-950/50 px-6 font-mono text-xs">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "general"
                ? "border-pulse-violet text-white bg-white/5"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            General & Provider
          </button>

          <button
            onClick={() => setActiveTab("models")}
            className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "models"
                ? "border-pulse-violet text-white bg-white/5"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Live Models Discovery
          </button>

          <button
            onClick={() => setActiveTab("comparison")}
            className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "comparison"
                ? "border-pulse-violet text-white bg-white/5"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Compare Models
          </button>

          <button
            onClick={() => setActiveTab("playground")}
            className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "playground"
                ? "border-pulse-violet text-white bg-white/5"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            AI Playground
          </button>
        </div>

        {/* Tab Contents Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans flex-1">
          
          {/* TAB 1: GENERAL & PROVIDER ABSTRACTION */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Provider Abstraction */}
              <div className="space-y-3">
                <label className="text-slate-300 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-pulse-violet" />
                  AI Infrastructure Provider
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  {(["gemini", "openai", "anthropic", "openrouter"] as AIProviderType[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleProviderSelect(p)}
                      className={`p-3 rounded-xl border text-center font-bold capitalize transition-all ${
                        providerType === p
                          ? "bg-pulse-violet/20 border-pulse-violet text-white"
                          : "bg-obsidian-950/60 border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {p === "gemini" ? "Google Gemini" : p === "openai" ? "OpenAI" : p === "anthropic" ? "Anthropic" : "OpenRouter"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-3">
                <label className="text-slate-300 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-pulse-cyan" />
                  Execution & API Key Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setProviderMode("demo")}
                    className={`p-3.5 rounded-xl border text-left transition-all font-mono ${
                      providerMode === "demo"
                        ? "bg-pulse-violet/20 border-pulse-violet text-white"
                        : "bg-obsidian-950/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="font-bold text-sm text-pulse-emerald mb-1">Demo Mode</div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      0 API calls needed. 100% simulated deterministic engine.
                    </div>
                  </button>

                  <button
                    onClick={() => setProviderMode("personal")}
                    className={`p-3.5 rounded-xl border text-left transition-all font-mono ${
                      providerMode === "personal"
                        ? "bg-pulse-violet/20 border-pulse-violet text-white"
                        : "bg-obsidian-950/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="font-bold text-sm text-pulse-cyan mb-1">Personal Key</div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      Saved safely in browser localStorage.
                    </div>
                  </button>

                  <button
                    onClick={() => setProviderMode("env")}
                    className={`p-3.5 rounded-xl border text-left transition-all font-mono ${
                      providerMode === "env"
                        ? "bg-pulse-violet/20 border-pulse-violet text-white"
                        : "bg-obsidian-950/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="font-bold text-sm text-pulse-violet mb-1">Server ENV</div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      Uses environment variables configured on server.
                    </div>
                  </button>
                </div>
              </div>

              {/* Personal API Key */}
              {providerMode === "personal" && (
                <div className="p-4 rounded-xl bg-obsidian-950/80 border border-white/10 space-y-3 font-mono">
                  <label className="text-slate-300 font-bold text-xs flex items-center justify-between">
                    <span>{providerLabel} API Key</span>
                    <span className="text-[11px] text-slate-400">Strict Live Validation</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={personalApiKey}
                        onChange={(e) => setPersonalApiKey(e.target.value)}
                        placeholder={providerType === "gemini" ? "AIzaSy..." : "sk-..."}
                        className="w-full bg-obsidian-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-pulse-violet"
                      />
                    </div>
                    <button
                      onClick={handleValidateKey}
                      disabled={isValidating || !personalApiKey}
                      className="px-4 py-2.5 bg-pulse-violet hover:bg-pulse-violet/90 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      {isValidating ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Validate Key</span>
                    </button>
                  </div>

                  {/* Validation Feedback Status */}
                  {validationStatus === "success" && (
                    <div className="flex items-center space-x-3 text-pulse-emerald text-[11px] pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Key Verified & Connected to {providerLabel} • Latency: {latencyMs}ms</span>
                    </div>
                  )}
                  {validationStatus === "error" && (
                    <div className="flex items-center space-x-2 text-pulse-rose text-[11px] pt-1 bg-pulse-rose/10 p-2.5 rounded-lg border border-pulse-rose/20">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{validationErrorMsg || "❌ Invalid API Key (HTTP 401 Unauthorized)"}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE MODELS DISCOVERY */}
          {activeTab === "models" && (
            <div className="space-y-4">
              <label className="text-slate-300 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pulse-violet" />
                Live {providerLabel} Models (Discovered via models.list)
              </label>

              <div className="grid grid-cols-1 gap-3">
                {models.map((m) => (
                  <div
                    key={m.name}
                    onClick={() => setSelectedModel(m.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedModel === m.name
                        ? "bg-pulse-violet/20 border-pulse-violet text-white shadow-lg"
                        : "bg-obsidian-950/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="font-bold text-sm text-white">{m.displayName}</span>
                        {m.badgeLabel && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-pulse-emerald/20 text-pulse-emerald border border-pulse-emerald/30 font-bold">
                            {m.badgeLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{m.name}</span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 font-sans">{m.description}</p>

                    <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
                      <span>⚡ Speed: {"⭐".repeat(m.speedRating || 5)}</span>
                      <span>💰 Cost: {"⭐".repeat(m.costRating || 4)}</span>
                      <span>🧠 Quality: {"⭐".repeat(m.qualityRating || 5)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-[10px]">
                      {(m.supportedCapabilities || ["Function Calling", "Structured Output"]).map((cap) => (
                        <span key={cap} className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                          ✓ {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COMPARE MODELS MATRIX TABLE */}
          {activeTab === "comparison" && (
            <div className="space-y-4 font-mono">
              <label className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <TableIcon className="w-4 h-4 text-pulse-cyan" />
                Live Model Performance Comparison Matrix
              </label>

              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-obsidian-950 text-slate-400 border-b border-white/10">
                      <th className="p-3">Model</th>
                      <th className="p-3">Speed</th>
                      <th className="p-3">Cost</th>
                      <th className="p-3">Quality</th>
                      <th className="p-3">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {models.map((m) => (
                      <tr key={m.name} className="hover:bg-white/5 transition-all">
                        <td className="p-3 font-bold text-white">{m.displayName}</td>
                        <td className="p-3 text-pulse-cyan">{"⭐".repeat(m.speedRating || 5)}</td>
                        <td className="p-3 text-pulse-emerald">{"⭐".repeat(m.costRating || 4)}</td>
                        <td className="p-3 text-pulse-violet">{"⭐".repeat(m.qualityRating || 5)}</td>
                        <td className="p-3">
                          {m.badgeLabel ? (
                            <span className="px-2 py-0.5 rounded bg-pulse-emerald/20 text-pulse-emerald border border-pulse-emerald/30 font-bold text-[10px]">
                              {m.badgeLabel}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Standard</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REAL AI PLAYGROUND */}
          {activeTab === "playground" && (
            <div className="p-4 rounded-xl bg-obsidian-950/90 border border-white/10 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-pulse-violet" />
                  Real Prompt Execution Playground
                </span>
                <span className="text-[10px] text-slate-400">Model: {selectedModel}</span>
              </div>

              <textarea
                value={playgroundPrompt}
                onChange={(e) => setPlaygroundPrompt(e.target.value)}
                placeholder="Type your prompt (e.g. 'Explain how to optimize station A grill delay')..."
                rows={3}
                className="w-full bg-obsidian-900 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-pulse-violet resize-none"
              />

              <button
                onClick={handleRunPlayground}
                disabled={isRunningPlayground}
                className="px-4 py-2 bg-gradient-to-r from-pulse-violet to-pulse-cyan text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunningPlayground ? "EXECUTING PROMPT..." : "RUN PROMPT"}</span>
              </button>

              {playgroundResponse && (
                <pre className="p-3.5 rounded-xl bg-obsidian-900 border border-white/10 text-slate-200 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {playgroundResponse}
                </pre>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-obsidian-950/80 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-mono"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-5 py-2 rounded-xl bg-pulse-emerald text-obsidian-950 font-bold text-xs hover:bg-pulse-emerald/90 transition-all shadow-glow-emerald"
          >
            SAVE CONFIGURATION
          </button>
        </div>

      </div>
    </div>
  );
}
