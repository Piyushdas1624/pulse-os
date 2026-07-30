"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import AIHealthScanCard from "@/components/AIHealthScanCard";
import AICostSavingsCard from "@/components/AICostSavingsCard";
import AIMemoryWidget from "@/components/AIMemoryWidget";
import AIExplainabilityModal from "@/components/AIExplainabilityModal";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { isLiveProvider } from "@/lib/ai/providerState";
import { Panel, PanelHead, Button, Tag, cx } from "@/components/ui/primitives";
import { ArrowRight, Send, AlertCircle } from "lucide-react";

/**
 * AI advisor. The chat console now goes through the real provider layer
 * (sendAdvisorMessage), so demo answers are grounded in live store data and
 * a connected key hits the real model. The old keyword-matched setTimeout
 * canned replies are gone. Styling uses the same primitives as every other
 * page — no glass-panel, no neon, no ALL-CAPS mono.
 */

interface Msg {
  sender: "user" | "ai";
  text: string;
  fallback?: boolean;
}

export default function AIOperationsCenter() {
  const governor = usePulseStore((s) => s.governor);
  const sendAdvisorMessage = usePulseStore((s) => s.sendAdvisorMessage);
  const live = isLiveProvider(governor);

  const [messages, setMessages] = useState<Msg[]>([
    {
      sender: "ai",
      text: live
        ? "Advisor connected to your model. Ask about the floor, kitchen load or stock — answers are grounded in live state."
        : "Demo advisor. Answers are deterministic and grounded in your live floor, kitchen and stock state. Connect a provider key in Settings for live model answers.",
      fallback: !live,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { sender: "user", text: q }]);
    setBusy(true);
    const reply = await sendAdvisorMessage(q);
    setMessages((m) => [
      ...m,
      { sender: "ai", text: reply, fallback: governor.is_offline_fallback },
    ]);
    setBusy(false);
  }

  return (
    <ProtectedRoute allowedRoles={["owner", "manager"]}>
    <>
      <Navbar />
      <main className="mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end gap-4">
          <div>
            <div className="eyebrow mb-2">Advisor</div>
            <h1 className="text-[2.125rem]">Operations intelligence</h1>
            <p className="mt-2 max-w-[58ch] text-sm text-ink-subtle">
              Audit, telemetry and a grounded advisor. {live
                ? "Live calls run against your connected model."
                : "Running in demo — deterministic, grounded in live store data."}
            </p>
          </div>
          <Button variant="ghost" className="ml-auto" onClick={() => (window.location.href = "/settings")}>
            Configure provider <ArrowRight size={15} />
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* Left column: audit + telemetry */}
          <div className="flex flex-col gap-6">
            <AIHealthScanCard />
            <AICostSavingsCard />
          </div>

          {/* Right column: chat console (kept high so the input is reachable
              without double-scroll — errors.md 4.3) */}
          <div className="flex flex-col gap-6">
            <Panel className="flex h-[560px] flex-col">
              <PanelHead
                title="Ask the advisor"
                sub={live ? governor.selected_model : "deterministic"}
                action={!live ? <Tag tone="busy">Demo</Tag> : <Tag tone="ok">Live</Tag>}
              />

              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cx("flex", m.sender === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cx(
                        "max-w-[88%] whitespace-pre-line rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed",
                        m.sender === "user"
                          ? "border-line-loud bg-obsidian-800"
                          : "border-line-soft bg-obsidian-850"
                      )}
                    >
                      {m.text}
                      {m.fallback && m.sender === "ai" && (
                        <span className="mt-1.5 block text-[11px] text-ink-subtle">
                          Deterministic answer · connect a key for live model output
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="flex items-center gap-2 text-sm text-ink-subtle">
                    <span className="flex gap-1">
                      <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-subtle" />
                      <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-subtle [animation-delay:120ms]" />
                      <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-subtle [animation-delay:240ms]" />
                    </span>
                    {live ? "Model is thinking…" : "Building grounded answer…"}
                  </div>
                )}
              </div>

              <form onSubmit={send} className="border-t border-line-soft p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about wait times, stock, or what to batch…"
                    aria-label="Ask the advisor"
                    className="flex-1 rounded border border-line bg-obsidian-850 px-3.5 py-2.5 text-sm focus:border-line-loud focus:outline-none"
                  />
                  <Button type="submit" variant="primary" size="sm" disabled={busy || !input.trim()}>
                    <Send size={14} /> Send
                  </Button>
                </div>
              </form>
            </Panel>

            {governor.last_error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-state-riskDim bg-state-riskDim/35 px-4 py-3 text-sm text-state-risk">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Last request failed</div>
                  <div className="text-state-risk/90">{governor.last_error}</div>
                  <Link href="/settings" className="mt-1 inline-block text-xs font-semibold underline underline-offset-4">
                    Check provider settings
                  </Link>
                </div>
              </div>
            )}

            <AIMemoryWidget />
          </div>
        </div>
      </main>

      <AIExplainabilityModal />
    </>
    </ProtectedRoute>
  );
}
