"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { applyProviderConfig } from "@/lib/ai/providerState";
import type { AIProviderType, GeminiModelInfo } from "@/lib/types/pulse";
import { Button, Panel, Tag } from "@/components/ui/primitives";

const PROVIDERS: { id: AIProviderType; name: string; placeholder: string }[] = [
  { id: "gemini", name: "Google Gemini", placeholder: "AIza…" },
  { id: "openai", name: "OpenAI", placeholder: "sk-…" },
  { id: "anthropic", name: "Anthropic", placeholder: "sk-ant-…" },
  { id: "openrouter", name: "OpenRouter", placeholder: "sk-or-…" },
];

export default function AISettingsPanel() {
  const governor = usePulseStore((s) => s.governor);
  const [key, setKey] = useState(governor.personal_api_key ?? "");
  const [models, setModels] = useState<GeminiModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("What needs attention on the floor right now?");
  const [answer, setAnswer] = useState("");

  const provider = governor.provider_type;
  const meta = PROVIDERS.find((p) => p.id === provider) ?? PROVIDERS[0];

  useEffect(() => {
    setKey(governor.personal_api_key ?? "");
  }, [governor.personal_api_key]);

  async function discover() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/ai/health-scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "validate_key", providerType: provider, userApiKey: key }) });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.error ?? "Provider rejected the key");
      setModels(d.models);
      await applyProviderConfig({ provider_mode: "personal", provider_type: provider, personal_api_key: key.trim(), is_key_valid: true, validation_error: undefined, selected_model: d.selectedModel, is_offline_fallback: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Validation failed";
      setError(message); await applyProviderConfig({ is_key_valid: false, validation_error: message });
    } finally { setLoading(false); }
  }

  async function run() {
    setLoading(true); setError(""); setAnswer("");
    try {
      const r = await fetch("/api/ai/health-scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "run_playground", providerType: provider, providerMode: governor.provider_mode, userApiKey: governor.personal_api_key, selectedModel: governor.selected_model, userPrompt: prompt }) });
      const d = await r.json(); if (!r.ok || !d.success) throw new Error(d.error ?? "Generation failed"); setAnswer(d.response);
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed"); } finally { setLoading(false); }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Panel>
        <div className="border-b border-line-soft px-5 py-4"><h2 className="text-base font-semibold">Provider and live models</h2><p className="mt-1 text-sm text-ink-subtle">One place for provider selection, key validation and model discovery.</p></div>
        <div className="p-5">
          <div className="grid gap-2 sm:grid-cols-2">
            {PROVIDERS.map((p) => <button key={p.id} onClick={() => applyProviderConfig({ provider_type: p.id, selected_model: "", is_key_valid: false, validation_error: undefined })} className={`rounded border px-4 py-3 text-left text-sm ${provider === p.id ? "border-line-loud bg-obsidian-800" : "border-line-soft bg-obsidian-850 text-ink-muted"}`} aria-pressed={provider === p.id}>{p.name}</button>)}
          </div>
          <div className="mt-6 flex gap-2"><input value={key} onChange={(e) => setKey(e.target.value)} type="password" placeholder={meta.placeholder} className="min-w-0 flex-1 rounded border border-line bg-obsidian-850 px-3 py-2 text-sm focus:border-line-loud focus:outline-none" /><Button onClick={discover} disabled={loading || !key.trim()}>{loading ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />} Discover models</Button></div>
          {error && <p className="mt-3 flex gap-2 text-sm text-state-risk"><ShieldAlert size={16} />{error}</p>}
          {governor.is_key_valid && !error && <p className="mt-3 flex gap-2 text-sm text-state-ok"><Check size={16} />Connected. The header, advisor and playground use this same store state.</p>}
          <div className="mt-6 divide-y divide-line-soft">{models.map((m) => <button key={m.name} onClick={() => applyProviderConfig({ selected_model: m.name })} className={`flex w-full items-center gap-3 py-3 text-left ${governor.selected_model === m.name ? "text-ink" : "text-ink-muted"}`}><span className={`h-3.5 w-3.5 rounded-full border ${governor.selected_model === m.name ? "border-ink bg-ink" : "border-line-loud"}`} /><span className="min-w-0 flex-1"><b className="block text-sm">{m.displayName}</b><small className="block truncate text-xs text-ink-subtle">{m.name}</small></span>{m.isRecommended && <Tag tone="ok">Recommended</Tag>}</button>)}</div>
        </div>
      </Panel>
      <Panel>
        <div className="border-b border-line-soft px-5 py-4"><h2 className="text-base font-semibold">Live playground</h2><p className="mt-1 text-sm text-ink-subtle">Real provider response, or an explicit demo-state message.</p></div>
        <div className="p-5"><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className="w-full resize-none rounded border border-line bg-obsidian-850 p-3 text-sm focus:border-line-loud focus:outline-none" /><Button className="mt-3 w-full justify-center" onClick={run} disabled={loading || governor.provider_mode === "demo" || !governor.is_key_valid}>{loading ? "Running…" : "Run live prompt"}</Button>{answer && <pre className="mt-5 whitespace-pre-wrap border-t border-line-soft pt-5 text-sm leading-relaxed text-ink-muted">{answer}</pre>}</div>
      </Panel>
    </div>
  );
}
