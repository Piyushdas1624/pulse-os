"use client";

import { useEffect } from "react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { Button, Tag, cx } from "@/components/ui/primitives";
import { X, CheckCircle2, AlertOctagon, Cpu } from "lucide-react";

/**
 * Explainability modal — "Why" and "Why not" for an audit insight.
 * Styled with the same primitives as the rest of the app, and now closes on
 * Escape + backdrop click (errors.md 6.18). No glass-panel, no neon glow.
 */
export default function AIExplainabilityModal() {
  const { explainModalInsight, setExplainModalInsight } = usePulseStore();

  // 6.18: keyboard + screen-reader users couldn't dismiss. Close on Escape.
  useEffect(() => {
    if (!explainModalInsight) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExplainModalInsight(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [explainModalInsight, setExplainModalInsight]);

  if (!explainModalInsight) return null;
  const ins = explainModalInsight;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Explain recommendation"
      onClick={() => setExplainModalInsight(null)} // 6.18: backdrop close
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-obsidian-900 shadow-raise"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-3 border-b border-line-soft px-5 py-4">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border border-state-thinkDim bg-state-thinkDim/45 text-state-think">
            <Cpu size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Tag tone="think">Explainability</Tag>
              <span className="num text-xs text-ink-subtle">
                confidence {ins.confidence}% · {ins.snapshot_version}
              </span>
            </div>
            <h3 className="text-base font-semibold leading-snug">{ins.title}</h3>
          </div>
          <button
            onClick={() => setExplainModalInsight(null)}
            aria-label="Close"
            className="shrink-0 rounded p-1.5 text-ink-subtle transition-colors hover:bg-obsidian-800 hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-4">
          <div className="mb-5 rounded border border-line-soft bg-obsidian-850 p-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-subtle">
              Recommendation
            </div>
            <p className="text-sm font-medium">{ins.recommendation}</p>
          </div>

          <section className="mb-5">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-state-calm">
              <CheckCircle2 size={14} /> Why
            </h4>
            <ol className="space-y-2">
              {ins.reasoning.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 rounded border border-line-soft bg-obsidian-850 px-3 py-2.5 text-sm"
                >
                  <span className="num mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-state-calmDim text-xs font-semibold text-state-calm">
                    {i + 1}
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-state-busy">
              <AlertOctagon size={14} /> Why not
            </h4>
            <ul className="space-y-2">
              {(ins.why_not ?? []).map((alt, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 rounded border border-line-soft bg-obsidian-850 px-3 py-2.5 text-sm text-ink-muted"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-state-busyDim text-xs font-semibold text-state-busy">
                    ✕
                  </span>
                  <span>{alt}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="flex justify-end border-t border-line-soft px-5 py-3">
          <Button variant="ghost" size="sm" onClick={() => setExplainModalInsight(null)}>
            Close
          </Button>
        </footer>
      </div>
    </div>
  );
}
