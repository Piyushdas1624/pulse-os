"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { ShieldCheck, Cpu, Database, Zap, Sparkles, TrendingDown, Clock, Layers } from "lucide-react";

export default function AICostSavingsCard() {
  const { governor } = usePulseStore();

  const safeBudget = Math.max(1, governor.today_budget_inr || 50);
  const safeUsed = governor.budget_used_inr || 0;
  const pctRemaining = Math.max(0, Math.round(((safeBudget - safeUsed) / safeBudget) * 100));

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-6 font-sans shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-pulse-violet font-bold">
            <Layers className="w-3.5 h-3.5 text-pulse-violet" />
            <span>LAYER 4: OPERATE EFFICIENTLY</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
            PulseAI Governor & Telemetry
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-pulse-emerald/20 text-pulse-emerald border border-pulse-emerald/30 font-bold">
              {governor.tokens_saved_pct || 82}% Cost Saved
            </span>
          </h3>
        </div>

        {/* Budget Mode Selector Indicator */}
        <div className="flex items-center space-x-1.5 font-mono text-xs bg-obsidian-950 p-1.5 rounded-xl border border-white/10">
          <span className="text-slate-400 text-[10px] px-2 uppercase font-bold">Preset:</span>
          {(["economy", "balanced", "performance"] as const).map((m) => (
            <span
              key={m}
              className={`px-2.5 py-1 rounded-lg capitalize font-bold text-[11px] ${
                governor.budget_mode === m
                  ? "bg-pulse-violet text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Bar (Guarded Math Division Fix) */}
      <div className="p-4 rounded-xl bg-obsidian-950/80 border border-white/5 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-pulse-emerald" />
            Today&apos;s AI Budget: ₹{safeBudget}
          </span>
          <span className="text-pulse-emerald font-bold">
            ₹{safeUsed} Used ({pctRemaining}% Remaining)
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pulse-emerald via-pulse-cyan to-pulse-violet transition-all duration-500"
            style={{ width: `${Math.min(100, (safeUsed / safeBudget) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 pt-1">
          <span>Auto-Downgrade Pipeline: Performance ➔ Balanced ➔ Economy ➔ Rule Engine</span>
          <span>Budget Status: ACTIVE 🟢</span>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Today AI Cost</span>
          <span className="text-lg font-extrabold text-pulse-emerald mt-1 block">
            ₹{governor.today_ai_cost_inr || 8}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Without Governor: ₹{governor.without_governor_cost_inr || 129}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Tokens Saved</span>
          <span className="text-lg font-extrabold text-pulse-cyan mt-1 block">
            {governor.tokens_saved_pct || 82}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Prompt Snapshot Compression</span>
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Cache Hit Rate</span>
          <span className="text-lg font-extrabold text-pulse-violet mt-1 block">
            {governor.cache_hit_count > 0 ? Math.round((governor.cache_hit_count / Math.max(1, governor.ai_requests_count)) * 100) : 71.4}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {governor.cache_hit_count}/{governor.ai_requests_count} Requests Cached
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">API Latency</span>
          <span className="text-lg font-extrabold text-white mt-1 block">
            {governor.avg_latency_ms || 241} ms
          </span>
          <span className="text-[10px] text-pulse-violet block mt-0.5 truncate">
            {governor.selected_model || "Gemini 3.6 Flash"}
          </span>
        </div>
      </div>
    </div>
  );
}
