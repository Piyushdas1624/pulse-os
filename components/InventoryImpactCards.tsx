"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Package, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";

export default function InventoryImpactCards() {
  const { inventory } = usePulseStore();

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-4 font-sans shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 font-mono text-xs text-pulse-rose font-bold">
            <Package className="w-3.5 h-3.5 text-pulse-rose" />
            <span>REALTIME INVENTORY STOCK BURN RATE</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
            Stock Runout Risk & Loss Prevention
          </h3>
        </div>
      </div>

      {/* Inventory Items */}
      <div className="space-y-3 font-mono text-xs">
        {inventory.map((item) => {
          const isLow = item.current_stock <= item.min_threshold;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${
                isLow
                  ? "bg-pulse-rose/10 border-pulse-rose/40 text-white"
                  : "bg-obsidian-950/80 border-white/10 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between font-bold text-sm mb-1">
                <span className="text-white">{item.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    isLow
                      ? "bg-pulse-rose/20 text-pulse-rose border border-pulse-rose/30"
                      : "bg-pulse-emerald/20 text-pulse-emerald border border-pulse-emerald/30"
                  }`}
                >
                  {isLow ? `Est. Runout: ${item.est_runout_mins} mins` : "Stock Healthy"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                <span>Stock: {item.current_stock} {item.unit} (Safety: {item.min_threshold} {item.unit})</span>
                {isLow && (
                  <span className="text-pulse-rose font-bold">
                    Risk Loss: ₹{item.potential_loss.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-3">
                <div
                  className={`h-full ${isLow ? "bg-pulse-rose animate-pulse" : "bg-pulse-emerald"}`}
                  style={{ width: `${Math.min(100, (item.current_stock / (item.min_threshold * 2.5)) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
