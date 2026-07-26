"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Table, TableStatus } from "@/lib/types/pulse";
import { Users, Clock, DollarSign } from "lucide-react";

export default function FloorPlanSvg() {
  const { tables, selectedTableId, setSelectedTableId, clearTable } = usePulseStore();

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "available":
        return { bg: "bg-pulse-emerald/10", border: "border-pulse-emerald/50", text: "text-pulse-emerald", label: "Available" };
      case "kitchen_cooking":
        return { bg: "bg-pulse-amber/10", border: "border-pulse-amber/50", text: "text-pulse-amber", label: "Kitchen Prep" };
      case "served":
        return { bg: "bg-pulse-cyan/10", border: "border-pulse-cyan/50", text: "text-pulse-cyan", label: "Served & Dining" };
      case "needs_cleaning":
        return { bg: "bg-pulse-rose/10", border: "border-pulse-rose/50", text: "text-pulse-rose", label: "Needs Clean" };
      case "occupied":
      default:
        return { bg: "bg-pulse-violet/10", border: "border-pulse-violet/50", text: "text-pulse-violet", label: "Occupied" };
    }
  };

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  return (
    <div className="space-y-4 font-sans">
      {/* Restaurant Blueprint Canvas Container */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-obsidian-900/90 relative overflow-hidden shadow-2xl">
        
        {/* Top Architectural Landmarks */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 rounded-lg bg-obsidian-950 border border-white/10 text-slate-300 font-bold">
              🚪 ENTRANCE / RECEPTION
            </span>
            <span className="px-3 py-1 rounded-lg bg-obsidian-950 border border-white/10 text-slate-300 font-bold">
              🍸 MAIN COCKTAIL BAR
            </span>
          </div>
          <span className="px-3 py-1 rounded-lg bg-pulse-violet/10 border border-pulse-violet/30 text-pulse-violet font-bold">
            🔥 KITCHEN PASS & PICKUP
          </span>
        </div>

        {/* 2D Floor Layout Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-2">
          {tables.map((table) => {
            const style = getStatusColor(table.status);
            const isSelected = table.id === selectedTableId;

            return (
              <div
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative flex flex-col justify-between h-36 ${
                  style.bg
                } ${style.border} ${
                  isSelected ? "ring-2 ring-pulse-cyan shadow-xl scale-[1.02]" : "hover:scale-[1.01]"
                }`}
              >
                {/* Table Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-base text-white">
                    Table {table.table_number}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${style.bg} ${style.text} border ${style.border}`}>
                    {style.label}
                  </span>
                </div>

                {/* Table Specs */}
                <div className="space-y-1 text-xs text-slate-300 font-mono my-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      Capacity:
                    </span>
                    <span className="font-bold text-white">{table.capacity} guests</span>
                  </div>

                  {table.bill_amount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-pulse-emerald" />
                        Bill:
                      </span>
                      <span className="font-extrabold text-pulse-emerald">
                        ₹{table.bill_amount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {table.seated_at && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Seated:
                      </span>
                      <span>{table.seated_at}</span>
                    </div>
                  )}
                </div>

                {/* Table Visual Representative Graphic */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full ${
                      table.status === "available"
                        ? "bg-pulse-emerald w-full"
                        : table.status === "kitchen_cooking"
                        ? "bg-pulse-amber w-3/4 animate-pulse"
                        : table.status === "served"
                        ? "bg-pulse-cyan w-full"
                        : "bg-pulse-violet w-1/2"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Architectural Landmark */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>🚻 GUEST RESTROOMS</span>
          <span className="text-pulse-cyan font-bold">LIVE DIGITAL TWIN ACTIVE</span>
          <span>📦 INVENTORY & REFRIGERATION</span>
        </div>
      </div>

      {/* Selected Table Controls Bar */}
      {selectedTable && (
        <div className="p-4 rounded-xl bg-obsidian-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-white text-sm">
              Selected: Table {selectedTable.table_number} ({selectedTable.capacity}p)
            </span>
            <span className="text-pulse-emerald font-bold">
              Current Bill: ₹{selectedTable.bill_amount.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => clearTable(selectedTable.id)}
            className="px-4 py-2 rounded-lg bg-pulse-rose/20 text-pulse-rose border border-pulse-rose/30 font-bold hover:bg-pulse-rose/30 transition-all"
          >
            Clear Table & Reset
          </button>
        </div>
      )}
    </div>
  );
}
