"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Cpu, Flame, CheckCircle2, ArrowRight } from "lucide-react";

export default function KitchenCPUScheduler() {
  const { kitchenQueue, advanceKitchenTicket } = usePulseStore();

  const batchedCount = kitchenQueue.filter((k) => k.prep_priority === "batched").length;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-4 font-sans shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 font-mono text-xs text-pulse-amber font-bold">
            <Cpu className="w-3.5 h-3.5 text-pulse-amber" />
            <span>KITCHEN CPU PROCESS SCHEDULER</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
            Smart Process Queue & Ticket Batching
          </h3>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-xl bg-pulse-amber/20 text-pulse-amber border border-pulse-amber/30 font-bold">
          🔥 {batchedCount > 0 ? `${batchedCount} Smart Batches` : "CPU Scheduling Active"}
        </span>
      </div>

      {/* Ticket List */}
      <div className="space-y-3 font-mono text-xs">
        {kitchenQueue.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 rounded-xl bg-obsidian-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{ticket.dish_name} × {ticket.qty}</span>
                {ticket.prep_priority === "batched" && (
                  <span className="px-2 py-0.5 rounded bg-pulse-amber/20 text-pulse-amber border border-pulse-amber/30 text-[10px] font-bold">
                    🔥 SMART BATCHED
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-xs mt-1">
                {ticket.station} • Tables: {ticket.table_numbers.map((tn) => `T${tn}`).join(", ")}
              </div>
            </div>

            <div className="flex items-center space-x-3 self-end sm:self-auto">
              <span
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase ${
                  ticket.status === "ready"
                    ? "bg-pulse-emerald/20 text-pulse-emerald border border-pulse-emerald/30"
                    : "bg-pulse-amber/20 text-pulse-amber border border-pulse-amber/30 animate-pulse"
                }`}
              >
                {ticket.status}
              </span>

              <button
                onClick={() => advanceKitchenTicket(ticket.id)}
                className="px-3.5 py-1.5 rounded-xl bg-pulse-emerald text-obsidian-950 font-bold text-xs hover:bg-pulse-emerald/90 transition-all flex items-center space-x-1 shadow-glow-emerald"
              >
                <span>Mark Ready</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
