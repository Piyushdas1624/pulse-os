"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Zap, Activity, CheckCircle, HelpCircle, ArrowRight, ShieldCheck, Sparkles, AlertTriangle, TrendingUp, Cpu } from "lucide-react";

export default function AIHealthScanCard() {
  const {
    aiInsights,
    triggerExecutiveAudit,
    isScanningAI,
    applyAIRecommendation,
    setExplainModalInsight,
    orders,
    tables,
    getComputedHealthScore,
    getComputedRiskLevel,
    getComputedOpportunity,
    getComputedBottleneck,
  } = usePulseStore();

  const primaryInsight = aiInsights[0];
  const occupiedTablesCount = tables.filter((t) => t.status !== "available").length;

  const dynamicHealthScore = getComputedHealthScore();
  const dynamicRiskLevel = getComputedRiskLevel();
  const dynamicOpportunity = getComputedOpportunity();
  const dynamicBottleneck = getComputedBottleneck();

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-obsidian-900/90 relative overflow-hidden shadow-2xl space-y-6 font-sans">
      
      {/* 1. Linear Storytelling Hero Banner: "What's happening in my restaurant?" */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 font-mono text-xs text-pulse-violet font-bold">
            <Sparkles className="w-3.5 h-3.5 text-pulse-violet" />
            <span>EXECUTIVE OPERATIONS INTELLIGENCE</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-3">
            Good Evening 👋 Your Restaurant is Operating Efficiently
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-pulse-emerald/20 text-pulse-emerald border border-pulse-emerald/30 font-bold">
              Health Score: {dynamicHealthScore}% 🟢
            </span>
          </h2>
        </div>

        <button
          onClick={triggerExecutiveAudit}
          disabled={isScanningAI}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pulse-violet to-pulse-cyan text-white font-bold text-xs hover:scale-105 transition-all flex items-center space-x-2 disabled:opacity-50 shadow-lg"
        >
          <Zap className={`w-4 h-4 ${isScanningAI ? "animate-bounce" : ""}`} />
          <span>{isScanningAI ? "RUNNING EXECUTIVE AUDIT..." : "TRIGGER AUDIT"}</span>
        </button>
      </div>

      {/* 2. Key Operational Metrics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Health Score</div>
          <div className="text-lg font-extrabold text-pulse-emerald mt-0.5">
            {dynamicHealthScore}% 🟢
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Risk Level</div>
          <div
            className={`text-lg font-extrabold mt-0.5 ${
              dynamicRiskLevel === "HIGH"
                ? "text-pulse-rose"
                : dynamicRiskLevel === "MODERATE"
                ? "text-pulse-amber"
                : "text-pulse-cyan"
            }`}
          >
            {dynamicRiskLevel}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Revenue Upside</div>
          <div className="text-lg font-extrabold text-pulse-emerald mt-0.5">
            +₹{dynamicOpportunity.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Main Bottleneck</div>
          <div className="text-xs font-bold text-pulse-amber truncate mt-1">
            {dynamicBottleneck}
          </div>
        </div>
      </div>

      {/* 3. Primary Guided Operational Issue Card */}
      {primaryInsight && (
        <div className="p-5 rounded-xl bg-obsidian-950/90 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-pulse-violet" />
              {primaryInsight.title}
            </h3>

            <button
              onClick={() => setExplainModalInsight(primaryInsight)}
              className="text-xs font-mono text-pulse-violet hover:underline flex items-center gap-1 bg-pulse-violet/10 px-2.5 py-1 rounded-lg border border-pulse-violet/20"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why? & Why Not?</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-3 rounded-lg bg-obsidian-900 border border-white/5">
              <span className="text-[10px] uppercase font-mono font-bold text-pulse-rose block mb-1">
                1. WHAT IS HAPPENING RIGHT NOW?
              </span>
              <p className="text-slate-200">{primaryInsight.problem}</p>
            </div>

            <div className="p-3 rounded-lg bg-obsidian-900 border border-white/5">
              <span className="text-[10px] uppercase font-mono font-bold text-pulse-amber block mb-1">
                2. WHY IS IT HAPPENING?
              </span>
              <p className="text-slate-200">{primaryInsight.cause}</p>
            </div>

            <div className="p-3 rounded-lg bg-obsidian-900 border border-white/5 md:col-span-2">
              <span className="text-[10px] uppercase font-mono font-bold text-pulse-cyan block mb-1">
                3. WHAT SHOULD MANAGER DO NEXT?
              </span>
              <p className="text-white font-semibold text-sm">{primaryInsight.recommendation}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-pulse-emerald/15 to-pulse-cyan/15 border border-pulse-emerald/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-pulse-emerald block">
                PROJECTED OUTCOME
              </span>
              <span className="text-slate-200 mt-1 block">
                Wait Time -{primaryInsight.business_impact.wait_reduction_pct}% • Revenue +₹{primaryInsight.business_impact.revenue_increase_val.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => applyAIRecommendation(primaryInsight.id)}
              className="px-5 py-2.5 rounded-xl bg-pulse-emerald text-obsidian-950 font-bold text-xs hover:bg-pulse-emerald/90 transition-all flex items-center space-x-1.5 shadow-glow-emerald"
            >
              <span>EXECUTE INTERVENTION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
