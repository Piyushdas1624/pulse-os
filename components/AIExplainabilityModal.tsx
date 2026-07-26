"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { HelpCircle, X, CheckCircle2, AlertOctagon, Cpu, ShieldAlert } from "lucide-react";

export default function AIExplainabilityModal() {
  const { explainModalInsight, setExplainModalInsight } = usePulseStore();

  if (!explainModalInsight) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-pulse-violet/40 bg-obsidian-900 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => setExplainModalInsight(null)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-pulse-violet/20 border border-pulse-violet/30 text-pulse-violet">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-pulse-violet/20 text-pulse-violet border border-pulse-violet/30 font-bold">
                Dual AI Explainability Engine
              </span>
              <span className="text-xs font-mono text-slate-400">
                Confidence: {explainModalInsight.confidence}% • Snapshot: {explainModalInsight.snapshot_version}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Reasoning Engine: Why & Why Not Analysis
            </h3>
          </div>
        </div>

        {/* Target Recommendation Summary */}
        <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/10 mb-6 text-xs font-sans">
          <span className="text-slate-400 font-mono block mb-1">Target Executive Intervention:</span>
          <span className="text-white font-semibold text-sm">{explainModalInsight.recommendation}</span>
        </div>

        {/* Section 1: WHY? (Positive Decision Tree) */}
        <div className="space-y-3 mb-6">
          <span className="text-xs uppercase font-mono font-bold text-pulse-cyan flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-pulse-cyan" />
            1. WHY? (Triggering Data Metrics)
          </span>

          {explainModalInsight.reasoning.map((reason, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-obsidian-950/60 border border-white/5 flex items-start space-x-3 text-xs"
            >
              <div className="w-5 h-5 rounded-full bg-pulse-cyan/20 border border-pulse-cyan/30 text-pulse-cyan flex items-center justify-center font-mono font-bold text-[11px] mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-slate-200 font-medium">{reason}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: WHY NOT? (Counter-factual Reasoning) */}
        <div className="space-y-3 mb-6">
          <span className="text-xs uppercase font-mono font-bold text-pulse-amber flex items-center gap-1.5 mb-2">
            <AlertOctagon className="w-4 h-4 text-pulse-amber" />
            2. WHY NOT ALTERNATIVES? (Counter-factual Reasoning)
          </span>

          {(explainModalInsight.why_not || [
            "Why not open Line 2 Grill? ➔ Only 2 pending patty orders exist; extra line cook cost (₹800/hr) exceeds wait savings.",
            "Why not defer burger tickets? ➔ Table 5 guest expectation SLA is 12 mins.",
          ]).map((alt, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-obsidian-950/60 border border-pulse-amber/20 flex items-start space-x-3 text-xs"
            >
              <div className="w-5 h-5 rounded-full bg-pulse-amber/20 border border-pulse-amber/30 text-pulse-amber flex items-center justify-center font-mono font-bold text-[11px] mt-0.5">
                ✕
              </div>
              <div className="flex-1">
                <p className="text-slate-300 font-mono leading-relaxed">{alt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => setExplainModalInsight(null)}
            className="px-4 py-2 rounded-xl bg-pulse-violet text-white font-bold text-xs hover:bg-pulse-violet/90 transition-all shadow-glow"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
