"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Activity, Clock, ShieldAlert, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export default function LiveEventTimeline() {
  const { liveEvents } = usePulseStore();

  const getEventBadge = (severity: string) => {
    switch (severity) {
      case "danger":
        return { icon: ShieldAlert, color: "text-pulse-rose border-pulse-rose/30 bg-pulse-rose/10" };
      case "warning":
        return { icon: AlertTriangle, color: "text-pulse-amber border-pulse-amber/30 bg-pulse-amber/10" };
      case "success":
        return { icon: CheckCircle2, color: "text-pulse-emerald border-pulse-emerald/30 bg-pulse-emerald/10" };
      case "info":
      default:
        return { icon: Info, color: "text-pulse-cyan border-pulse-cyan/30 bg-pulse-cyan/10" };
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-obsidian-900/90 space-y-4 font-sans h-full flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2 font-mono">
          <Activity className="w-4 h-4 text-pulse-cyan animate-pulse" />
          <h3 className="font-bold text-white text-sm tracking-tight">Live Event Timeline</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pulse-emerald/20 text-pulse-emerald border border-pulse-emerald/30 font-bold">
          Realtime Ticker
        </span>
      </div>

      {/* Event Stream List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px] font-mono text-xs">
        {liveEvents.map((ev) => {
          const badge = getEventBadge(ev.severity);
          const Icon = badge.icon;

          return (
            <div
              key={ev.id}
              className={`p-3 rounded-xl border ${badge.color} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {ev.type} {ev.table_number ? `• T${ev.table_number}` : ""}
                </span>
                <span className="text-slate-400 font-normal">{ev.timestamp}</span>
              </div>
              <p className="text-slate-200 text-xs font-sans font-medium">{ev.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
