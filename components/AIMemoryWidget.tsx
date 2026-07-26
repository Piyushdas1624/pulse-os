"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { History, TrendingDown, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default function AIMemoryWidget() {
  const { aiMemory } = usePulseStore();

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-pulse-emerald" />
          <h3 className="font-bold text-white text-base">Operational AI Memory Log</h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-pulse-emerald/10 text-pulse-emerald border border-pulse-emerald/20">
          Applied Outcomes Tracked
        </span>
      </div>

      {/* Memory Cards */}
      <div className="space-y-3">
        {aiMemory.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-obsidian-900/80 border border-white/5 flex items-center justify-between text-xs transition-all hover:border-white/15"
          >
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold text-white text-sm">{item.title}</span>
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.timestamp}
                </span>
              </div>
              <p className="text-slate-400 font-mono">{item.action_taken}</p>
            </div>

            {/* Metric Outcome Badge */}
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block">{item.outcome_metric}</span>
              <span
                className={`text-sm font-extrabold flex items-center justify-end gap-1 ${
                  item.delta_pct < 0 ? "text-pulse-emerald" : "text-pulse-cyan"
                }`}
              >
                {item.delta_pct < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {item.delta_pct > 0 ? `+${item.delta_pct}%` : `${item.delta_pct}%`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
