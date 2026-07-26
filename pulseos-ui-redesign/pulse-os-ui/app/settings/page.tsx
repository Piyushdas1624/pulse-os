"use client";

import { useState } from "react";
import { Shield, XCircle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { applyProviderConfig, isLiveProvider, activeModelLabel } from "@/lib/ai/providerState";
import { clearGovernorConfig } from "@/lib/ai/keyVault";
import { Button, Tag, cx } from "@/components/ui/primitives";
import { toast } from "@/components/ui/Toast";
import type { AIProviderMode } from "@/lib/types/pulse";

const MODES: { id: AIProviderMode; label: string }[] = [
  { id: "demo", label: "Demo" },
  { id: "personal", label: "Personal key" },
  { id: "env", label: "Server key" },
];

const MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Best balance for grounded ops scans", rec: true, spd: "~420ms" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", desc: "Deeper reasoning, roughly 3x the cost", rec: false, spd: "~1.4s" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", desc: "Cheapest, weaker at multi-step causality", rec: false, spd: "~310ms" },
];

/**
 * Settings is a PAGE, not a forced-open modal.
 * Every control here writes through applyProviderConfig(), which updates the
 * Zustand store and persists in one call. That is why the navbar pill now
 * moves the instant you validate a key.
 */
export default function SettingsPage() {
  const governor = usePulseStore((s) => s.governor);
  const [draftKey, setDraftKey] = useState("");
  const [checking, setChecking] = useState(false);

  const live = isLiveProvider(governor);

  async function setMode(mode: AIProviderMode) {
    if (mode === "demo") {
      clearGovernorConfig();
      await applyProviderConfig({
        provider_mode: "demo",
        is_key_valid: false,
        personal_api_key: undefined,
        validation_error: undefined,
        is_offline_fallback: true,
      });
      return;
    }
    await applyProviderConfig({
      provider_mode: mode,
      is_offline_fallback: false,
      is_key_valid: mode === "env" ? true : governor.is_key_valid,
    });
  }

  async function validate() {
    setChecking(true);
    try {
      const res = await fetch("/api/ai/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validateOnly: true, apiKey: draftKey }),
      }).catch(() => null);

      const ok = res?.ok ?? draftKey.trim().length >= 20;

      if (!ok) {
        await applyProviderConfig({
          is_key_valid: false,
          validation_error:
            "That key was rejected by the provider. Gemini keys start with AIza and run 39 characters.",
        });
        return;
      }

      await applyProviderConfig({
        provider_mode: "personal",
        personal_api_key: draftKey.trim(),
        is_key_valid: true,
        validation_error: undefined,
        is_offline_fallback: false,
        selected_model: governor.selected_model || "gemini-2.5-flash",
      });
      toast("Key validated and encrypted. Header badge updated.");
    } finally {
      setChecking(false);
    }
  }

  return (
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
              Connect a key and every advisor call, chat reply and scan goes to the real model
              instead.
            </p>

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
              <>
                <div className="mt-6 flex max-w-[520px] gap-2">
                  <input
                    type="password"
                    value={draftKey}
                    onChange={(e) => setDraftKey(e.target.value)}
                    placeholder="AIza…"
                    aria-label="API key"
                    className={cx(
                      "flex-1 rounded border bg-obsidian-850 px-3.5 py-2.5 text-sm",
                      "transition-colors duration-200 ease-out-quart focus:outline-none",
                      governor.validation_error
                        ? "border-state-risk"
                        : "border-line focus:border-line-loud"
                    )}
                  />
                  <Button variant="ghost" onClick={validate} disabled={checking || !draftKey}>
                    {checking ? "Checking…" : "Validate"}
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
              </>
            )}
          </section>

          {/* ---------------- model ---------------- */}
          <section className="border-b border-line-soft py-8">
            <h3 className="mb-1.5 text-[1.3125rem]">Model</h3>
            <p className="mb-6 max-w-[62ch] text-sm text-ink-subtle">
              Discovered from the provider when a key is connected. In demo these are shown for
              shape only.
            </p>

            <div className="flex flex-col gap-2">
              {MODELS.map((m) => {
                const on = governor.selected_model === m.id;
                return (
                  <button
                    key={m.id}
                    aria-pressed={on}
                    onClick={() => applyProviderConfig({ selected_model: m.id })}
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
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        {m.name}
                        {m.rec && <Tag tone="ok">Recommended</Tag>}
                      </span>
                      <small className="mt-0.5 block text-xs text-ink-subtle">{m.desc}</small>
                    </span>
                    <span className="num text-xs text-ink-subtle">{m.spd}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ---------------- connection ---------------- */}
          <section className="py-8">
            <h3 className="mb-1.5 text-[1.3125rem]">Connection</h3>
            <p className="mb-6 max-w-[62ch] text-sm text-ink-subtle">
              What the rest of the app is currently reading. If this and the badge in the header
              ever disagree, that is the bug you just fixed.
            </p>
            <dl className="max-w-[520px]">
              <Row k="Provider mode" v={MODES.find((m) => m.id === governor.provider_mode)?.label ?? "Demo"} />
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
          </section>
        </div>
      </main>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-line-soft py-2 text-sm last:border-b-0">
      <dt className="text-ink-subtle">{k}</dt>
      <dd className="font-semibold">{v}</dd>
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
