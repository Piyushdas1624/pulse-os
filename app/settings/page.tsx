"use client";

import { useEffect, useState } from "react";
import { Shield, XCircle, CheckCircle2, Loader2, KeyRound, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import { usePulseStore } from "@/lib/store/usePulseStore";
import {
  applyProviderConfig,
  isLiveProvider,
  activeModelLabel,
} from "@/lib/ai/providerState";
import { clearGovernorConfig } from "@/lib/ai/keyVault";
import { Button, Tag, cx } from "@/components/ui/primitives";
import { toast } from "@/components/ui/Toast";
import type { AIProviderMode, AIProviderType, GeminiModelInfo } from "@/lib/types/pulse";

const PROVIDERS: { id: AIProviderType; label: string; placeholder: string }[] = [
  { id: "gemini", label: "Google Gemini", placeholder: "AIza…" },
  { id: "openai", label: "OpenAI", placeholder: "sk-…" },
  { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-…" },
  { id: "openrouter", label: "OpenRouter", placeholder: "sk-or-…" },
];

const MODES: { id: AIProviderMode; label: string }[] = [
  { id: "demo", label: "Demo" },
  { id: "personal", label: "Personal key" },
  { id: "env", label: "Server key" },
];

/**
 * Settings is a PAGE, not a modal. Every control here writes through
 * applyProviderConfig(), which updates the Zustand store and persists in one
 * call. The navbar pill, the telemetry card and triggerExecutiveAudit all read
 * governor.* — so they move the instant you change something here.
 *
 * The old hardcoded gemini-2.5-* model list and the "length >= 20" fake
 * validation are gone. Validation now hits the real models.list endpoint and
 * returns the live model set; gemini-3.6-flash is tagged Recommended when the
 * key sees it.
 */
export default function SettingsPage() {
  const governor = usePulseStore((s) => s.governor);

  const [draftKey, setDraftKey] = useState("");
  const [checking, setChecking] = useState(false);
  const [models, setModels] = useState<GeminiModelInfo[]>([]);
  const [discovering, setDiscovering] = useState(false);

  const live = isLiveProvider(governor);

  // When the provider or key changes at the store level (e.g. rehydrate on
  // refresh), try to pull the live model list so the selector isn't empty.
  async function discover(type: AIProviderType, key: string) {
    if (!key.trim()) {
      setModels([]);
      return;
    }
    setDiscovering(true);
    try {
      const res = await fetch("/api/ai/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fetch_models",
          providerType: type,
          userApiKey: key,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.models)) {
        setModels(data.models as GeminiModelInfo[]);
      } else {
        setModels([]);
      }
    } catch {
      setModels([]);
    } finally {
      setDiscovering(false);
    }
  }

  // Re-discover when provider type flips (so the list reflects the new
  // provider) — but only if we already have a valid key in the store.
  useEffect(() => {
    if (live && governor.personal_api_key) {
      discover(governor.provider_type, governor.personal_api_key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [governor.provider_type]);

  async function setProvider(type: AIProviderType) {
    await applyProviderConfig({
      provider_type: type,
      // Don't carry a Gemini model name into OpenAI etc. Leave the previous
      // selection; the user picks from the discovered list.
    });
  }

  async function setMode(mode: AIProviderMode) {
    if (mode === "demo") {
      clearGovernorConfig();
      await applyProviderConfig({
        provider_mode: "demo",
        is_key_valid: false,
        personal_api_key: undefined,
        validation_error: undefined,
        is_offline_fallback: true,
        selected_model: "gemini-3.6-flash",
      });
      setModels([]);
      return;
    }
    await applyProviderConfig({
      provider_mode: mode,
      is_offline_fallback: false,
      is_key_valid: mode === "env" ? true : governor.is_key_valid,
    });
  }

  // Real validation. No "length >= 20" fallback — the API rejects bad keys and
  // we show that message. On success we persist the key, mark it valid, and
  // populate the live model list.
  async function validate() {
    if (!draftKey.trim()) return;
    setChecking(true);
    try {
      const res = await fetch("/api/ai/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate_key",
          providerType: governor.provider_type,
          userApiKey: draftKey.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const list = (data.models ?? []) as GeminiModelInfo[];
        setModels(list);
        const chosen = data.selectedModel ?? list[0]?.name ?? governor.selected_model;
        await applyProviderConfig({
          provider_mode: "personal",
          provider_type: governor.provider_type,
          personal_api_key: draftKey.trim(),
          is_key_valid: true,
          validation_error: undefined,
          is_offline_fallback: false,
          selected_model: chosen,
        });
        toast("Key verified. Header badge updated.");
      } else {
        await applyProviderConfig({
          is_key_valid: false,
          validation_error: data.error || "That key was rejected by the provider.",
        });
      }
    } catch {
      await applyProviderConfig({
        is_key_valid: false,
        validation_error: "Could not reach the provider to validate the key.",
      });
    } finally {
      setChecking(false);
    }
  }

  async function setBudget(raw: string) {
    const n = Math.max(0, Math.round(Number(raw) || 0));
    await applyProviderConfig({ today_budget_inr: n });
  }

  async function disconnect() {
    clearGovernorConfig();
    await applyProviderConfig({
      provider_mode: "demo",
      is_key_valid: false,
      personal_api_key: undefined,
      validation_error: undefined,
      is_offline_fallback: true,
      selected_model: "gemini-3.6-flash",
    });
    setModels([]);
    setDraftKey("");
    toast("Disconnected. Running in demo mode.");
  }

  const providerMeta = PROVIDERS.find((p) => p.id === governor.provider_type)!;

  return (
    <ProtectedRoute allowedRoles={["owner", "manager"]}>
    <>
      <Navbar />
      <main className="mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12">
        <div className="mb-8">
          <div className="eyebrow mb-2">Configuration</div>
          <h1 className="text-[2.125rem]">Settings</h1>
        </div>

        <div className="max-w-[760px]">
          {/* ---------------- provider ---------------- */}
          <section className="border-b border-line-soft pb-8">
            <h3 className="mb-1.5 text-[1.3125rem]">Provider</h3>
            <p className="mb-6 max-w-[62ch] text-sm text-ink-subtle">
              Demo runs entirely on device with deterministic answers built from your live store.
              Connect a key and every audit, advisor reply and scan goes to the real model instead.
            </p>

            <div className="mb-5">
              <Label className="mb-2">Service</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PROVIDERS.map((p) => {
                  const on = governor.provider_type === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      aria-pressed={on}
                      className={cx(
                        "rounded border px-3 py-2.5 text-left text-sm font-medium",
                        "transition-colors duration-200 ease-out-quart",
                        on
                          ? "border-line-loud bg-obsidian-800"
                          : "border-line-soft bg-obsidian-850 hover:border-line-loud"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Label className="mb-2">Key mode</Label>
            <div className="inline-flex gap-0.5 rounded border border-line bg-obsidian-850 p-[3px]" role="group">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  aria-pressed={governor.provider_mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={cx(
                    "rounded-[7px] px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ease-out-quart",
                    governor.provider_mode === m.id
                      ? "bg-obsidian-700 text-ink"
                      : "text-ink-subtle hover:text-ink"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {governor.provider_mode === "personal" && (
              <div className="mt-6">
                <div className="flex max-w-[520px] gap-2">
                  <div className="relative flex-1">
                    <KeyRound
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
                    />
                    <input
                      type="password"
                      value={draftKey}
                      onChange={(e) => setDraftKey(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && validate()}
                      placeholder={providerMeta.placeholder}
                      aria-label={`${providerMeta.label} API key`}
                      className={cx(
                        "w-full rounded border bg-obsidian-850 py-2.5 pl-9 pr-3.5 text-sm",
                        "transition-colors duration-200 ease-out-quart focus:outline-none",
                        governor.validation_error
                          ? "border-state-risk"
                          : "border-line focus:border-line-loud"
                      )}
                    />
                  </div>
                  <Button variant="ghost" onClick={validate} disabled={checking || !draftKey.trim()}>
                    {checking ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Checking…
                      </>
                    ) : (
                      "Validate"
                    )}
                  </Button>
                </div>

                <Note
                  tone={
                    governor.validation_error ? "err" : governor.is_key_valid ? "good" : "neutral"
                  }
                >
                  {governor.validation_error ??
                    (governor.is_key_valid
                      ? "Connected and encrypted at rest in this browser. Survives refresh."
                      : "Stored encrypted in this browser with AES-GCM. Worth being straight with you: the passphrase ships in the bundle, so this is obfuscation, not real secrecy. Anyone with access to the machine can recover it. Real secrecy needs a server-side vault.")}
                </Note>

                {governor.is_key_valid && governor.personal_api_key && (
                  <button
                    onClick={disconnect}
                    className="mt-3 text-xs font-semibold text-ink-subtle underline-offset-4 hover:text-state-risk hover:underline"
                  >
                    Disconnect key
                  </button>
                )}
              </div>
            )}
          </section>

          {/* ---------------- model ---------------- */}
          <section className="border-b border-line-soft py-8">
            <h3 className="mb-1.5 text-[1.3125rem]">Model</h3>
            <p className="mb-6 max-w-[62ch] text-sm text-ink-subtle">
              {live
                ? "Discovered live from the provider's models endpoint for your key."
                : "Connect and validate a key to discover the live model list. In demo the default is shown for shape only."}
            </p>

            {discovering ? (
              <div className="flex items-center gap-2 text-sm text-ink-subtle">
                <Loader2 size={15} className="animate-spin" /> Discovering models…
              </div>
            ) : models.length > 0 ? (
              <div className="max-h-[320px] overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
                {models.map((m) => {
                  const on = governor.selected_model === m.name;
                  return (
                    <button
                      key={m.name}
                      aria-pressed={on}
                      onClick={() => applyProviderConfig({ selected_model: m.name })}
                      className={cx(
                        "grid w-full grid-cols-[18px_1fr_auto] items-center gap-3 rounded border px-4 py-3 text-left",
                        "transition-colors duration-200 ease-out-quart",
                        on
                          ? "border-line-loud bg-obsidian-800"
                          : "border-line-soft bg-obsidian-850 hover:border-line-loud"
                      )}
                    >
                      <span
                        className={cx(
                          "relative h-[15px] w-[15px] rounded-full border-[1.5px]",
                          on ? "border-ink" : "border-line-loud"
                        )}
                      >
                        {on && <span className="absolute inset-[3px] rounded-full bg-ink" />}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          {m.displayName || m.name}
                          {/gemini-3\.6-flash/i.test(m.name) && <Tag tone="ok">Recommended</Tag>}
                          {m.isRecommended && !/gemini-3\.6-flash/i.test(m.name) && (
                            <Tag tone="calm">Good pick</Tag>
                          )}
                        </span>
                        <small className="mt-0.5 block truncate text-xs text-ink-subtle">
                          {m.description || m.name}
                        </small>
                      </span>
                      <span className="num shrink-0 text-xs text-ink-subtle">{m.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded border border-dashed border-line-loud px-4 py-3">
                <span className="text-sm text-ink-subtle">
                  {live ? "No models returned for this key." : "No key connected yet."}
                </span>
                <span className="num text-sm">{governor.selected_model}</span>
              </div>
            )}
          </section>

          {/* ---------------- budget ---------------- */}
          <section className="border-b border-line-soft py-8">
            <h3 className="mb-1.5 text-[1.3125rem]">Daily budget</h3>
            <p className="mb-6 max-w-[62ch] text-sm text-ink-subtle">
              Optional cap in rupees. When set, the spend bar on the advisor page reflects real
              usage. Cost is estimated from a rate table and labelled as such.
            </p>
            <div className="flex max-w-[520px] items-center gap-2">
              <span className="text-sm text-ink-subtle">₹</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                defaultValue={governor.today_budget_inr || ""}
                placeholder="No cap"
                onBlur={(e) => setBudget(e.target.value)}
                aria-label="Daily budget in rupees"
                className="w-40 rounded border border-line bg-obsidian-850 px-3.5 py-2.5 text-sm focus:border-line-loud focus:outline-none"
              />
              <span className="text-xs text-ink-subtle">/ day · estimated</span>
            </div>
          </section>

          {/* ---------------- connection ---------------- */}
          <section className="py-8">
            <h3 className="mb-1.5 text-[1.3125rem]">Connection</h3>
            <p className="mb-6 max-w-[62ch] text-sm text-ink-subtle">
              What the rest of the app is currently reading. If this and the badge in the header
              ever disagree, that is the bug.
            </p>
            <dl className="max-w-[520px]">
              <Row k="Provider" v={providerMeta.label} />
              <Row k="Key mode" v={MODES.find((m) => m.id === governor.provider_mode)?.label ?? "Demo"} />
              <Row k="Active model" v={activeModelLabel(governor)} />
              <Row
                k="Key status"
                v={
                  governor.provider_mode === "demo"
                    ? "Not required"
                    : governor.is_key_valid
                    ? "Valid, encrypted"
                    : governor.validation_error
                    ? "Rejected"
                    : "Not validated"
                }
              />
              <Row k="Answers come from" v={live ? "Live model" : "Deterministic fallback"} />
              <Row k="Survives refresh" v="Yes, rehydrated on mount" />
            </dl>

            <Link
              href="/ai-ops"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-subtle hover:text-ink"
            >
              Try it on the advisor <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </main>
    </>
    </ProtectedRoute>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cx("block text-xs font-semibold uppercase tracking-[0.04em] text-ink-subtle", className)}>
      {children}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-line-soft py-2 text-sm last:border-b-0">
      <dt className="text-ink-subtle">{k}</dt>
      <dd className="max-w-[60%] text-right font-semibold">{v}</dd>
    </div>
  );
}

function Note({ tone, children }: { tone: "err" | "good" | "neutral"; children: React.ReactNode }) {
  const Icon = tone === "err" ? XCircle : tone === "good" ? CheckCircle2 : Shield;
  return (
    <p
      className={cx(
        "mt-4 flex max-w-[60ch] gap-2.5 text-xs leading-relaxed",
        tone === "err" ? "text-state-risk" : tone === "good" ? "text-state-ok" : "text-ink-subtle"
      )}
    >
      <Icon size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
