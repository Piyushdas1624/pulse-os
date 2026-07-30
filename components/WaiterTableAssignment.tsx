"use client";

import { useState } from "react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel, PanelHead, cx } from "@/components/ui/primitives";
import { User, RefreshCw, ChevronDown } from "lucide-react";

/**
 * WaiterTableAssignment — Owner/Manager view.
 * Shows which waiter is assigned to each active table,
 * and lets owners force-assign a different waiter.
 */
export default function WaiterTableAssignment() {
  const { tables, staff, setSelectedTableId } = usePulseStore();
  const [overrides, setOverrides] = useState<Record<string, string>>({}); // tableId -> staffId
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const waiters = staff.filter(
    (s) => s.role === "floor_waiter" || s.role === "floor_captain" || s.role === "sommelier"
  );

  const activeTables = tables.filter((t) => t.status !== "available");

  const getAssignedWaiter = (tableId: string, tableNumber: number) => {
    const overrideId = overrides[tableId];
    if (overrideId) return staff.find((s) => s.id === overrideId) ?? null;
    // Find from table's assigned_waiter_id or round-robin
    const t = tables.find((t) => t.id === tableId);
    if (t?.assigned_waiter_id) return staff.find((s) => s.id === t.assigned_waiter_id) ?? null;
    return waiters.length > 0 ? waiters[(tableNumber - 1) % waiters.length] : null;
  };

  const shiftStatusColor = (status: string) => {
    if (status === "on_duty") return "bg-state-okDim text-state-ok";
    if (status === "break") return "bg-state-busyDim text-state-busy";
    return "bg-obsidian-800 text-ink-subtle";
  };

  return (
    <Panel>
      <PanelHead
        title="Waiter Assignment"
        sub={`${activeTables.length} active tables`}
      />
      {activeTables.length === 0 ? (
        <div className="px-5 py-6 text-center text-sm text-ink-subtle">
          No active tables right now.
        </div>
      ) : (
        <div className="divide-y divide-line-soft">
          {activeTables.map((table) => {
            const assigned = getAssignedWaiter(table.id, table.table_number);
            const isOpen = openDropdown === table.id;
            return (
              <div key={table.id} className="flex items-center gap-4 px-5 py-3.5">
                {/* Table badge */}
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-obsidian-800 text-sm font-semibold text-ink">
                  {table.table_number}
                </div>

                {/* Table info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">
                    Table {table.table_number}
                  </p>
                  <p className="text-xs text-ink-subtle capitalize">
                    {table.status.replace("_", " ")} · {table.capacity} seats
                    {table.seated_at ? ` · since ${table.seated_at}` : ""}
                  </p>
                </div>

                {/* Waiter assignment dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : table.id)}
                    className={cx(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                      isOpen
                        ? "border-line bg-obsidian-800"
                        : "border-line-soft bg-obsidian-850 hover:border-line"
                    )}
                  >
                    <User size={12} className="text-ink-subtle" />
                    <span className="font-medium">
                      {assigned ? assigned.full_name.split(" ")[0] : "Unassigned"}
                    </span>
                    {assigned && (
                      <span
                        className={cx(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                          shiftStatusColor(assigned.shift_status)
                        )}
                      >
                        {assigned.shift_status === "on_duty" ? "On" : assigned.shift_status === "break" ? "Break" : "Off"}
                      </span>
                    )}
                    <ChevronDown size={11} className={cx("text-ink-subtle transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {/* Dropdown */}
                  {isOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-line bg-obsidian-900 py-1 shadow-2xl">
                      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                        Force assign
                      </p>
                      {waiters.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => {
                            setOverrides((prev) => ({ ...prev, [table.id]: w.id }));
                            setOpenDropdown(null);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-obsidian-800"
                        >
                          <span
                            className={cx(
                              "h-2 w-2 rounded-full",
                              w.shift_status === "on_duty" ? "bg-state-ok" : w.shift_status === "break" ? "bg-state-busy" : "bg-ink-subtle"
                            )}
                          />
                          <span className="font-medium text-ink">{w.full_name}</span>
                          <span className="ml-auto text-ink-subtle capitalize">{w.role.replace("_", " ")}</span>
                        </button>
                      ))}
                      {overrides[table.id] && (
                        <button
                          onClick={() => {
                            setOverrides((prev) => {
                              const copy = { ...prev };
                              delete copy[table.id];
                              return copy;
                            });
                            setOpenDropdown(null);
                          }}
                          className="flex w-full items-center gap-2 border-t border-line-soft px-3 py-2 text-xs text-ink-subtle hover:bg-obsidian-800"
                        >
                          <RefreshCw size={11} /> Reset to default
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
