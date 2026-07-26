"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Clock, Flame, RefreshCw, Trash2, ShieldCheck, HeartPulse } from "lucide-react";

export default function OperationalKPIs() {
  const { tables, kitchenQueue, inventory } = usePulseStore();

  const occupiedTables = tables.filter((t) => t.status !== "available").length;
  const cookingCount = kitchenQueue.filter((k) => k.status === "cooking").length;
  const lowInventoryCount = inventory.filter((i) => i.current_stock <= i.min_threshold).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-sans">
      
      {/* 1. Wait Time */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>Average Wait Time</span>
          <Clock className="w-3.5 h-3.5 text-pulse-cyan" />
        </div>
        <div className="text-xl font-bold text-white font-mono">11.4 min</div>
        <div className="text-[10px] text-pulse-emerald font-mono">-18% vs average</div>
      </div>

      {/* 2. Kitchen Utilization */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>Kitchen Utilization</span>
          <Flame className="w-3.5 h-3.5 text-pulse-amber" />
        </div>
        <div className="text-xl font-bold text-white font-mono">
          {cookingCount > 0 ? `${Math.min(96, 70 + cookingCount * 7)}%` : "84%"}
        </div>
        <div className="text-[10px] text-pulse-amber font-mono">Optimal CPU Batching</div>
      </div>

      {/* 3. Table Turnover */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>Table Turnover</span>
          <RefreshCw className="w-3.5 h-3.5 text-pulse-emerald" />
        </div>
        <div className="text-xl font-bold text-white font-mono">42 min</div>
        <div className="text-[10px] text-pulse-emerald font-mono">+14% speed</div>
      </div>

      {/* 4. Food Waste */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>Food Waste Index</span>
          <Trash2 className="w-3.5 h-3.5 text-pulse-rose" />
        </div>
        <div className="text-xl font-bold text-white font-mono">1.2%</div>
        <div className="text-[10px] text-pulse-emerald font-mono">-4% waste</div>
      </div>

      {/* 5. Inventory Health */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>Inventory Health</span>
          <ShieldCheck className="w-3.5 h-3.5 text-pulse-violet" />
        </div>
        <div className="text-xl font-bold text-white font-mono">
          {lowInventoryCount > 0 ? "88%" : "94%"}
        </div>
        <div className="text-[10px] text-pulse-amber font-mono">
          {lowInventoryCount > 0 ? `${lowInventoryCount} Alert Active` : "Stock Healthy"}
        </div>
      </div>

      {/* 6. CSAT Score */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
          <span>CSAT Score</span>
          <HeartPulse className="w-3.5 h-3.5 text-pulse-cyan" />
        </div>
        <div className="text-xl font-bold text-white font-mono">98.2%</div>
        <div className="text-[10px] text-pulse-emerald font-mono">+2.4% rating</div>
      </div>

    </div>
  );
}
