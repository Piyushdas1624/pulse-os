"use client";

import { Check, CreditCard, Users } from "lucide-react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { TableStatus } from "@/lib/types/pulse";

const styles: Record<TableStatus, { label: string; dot: string; border: string; background: string }> = {
  available: { label: "Open", dot: "bg-emerald-500", border: "border-emerald-200", background: "bg-emerald-50" },
  occupied: { label: "Seated", dot: "bg-blue-500", border: "border-blue-200", background: "bg-blue-50" },
  ordering: { label: "Ordering", dot: "bg-amber-500", border: "border-amber-200", background: "bg-amber-50" },
  kitchen_cooking: { label: "In kitchen", dot: "bg-orange-500", border: "border-orange-200", background: "bg-orange-50" },
  served: { label: "Dining", dot: "bg-violet-500", border: "border-violet-200", background: "bg-violet-50" },
  needs_cleaning: { label: "To clean", dot: "bg-rose-500", border: "border-rose-200", background: "bg-rose-50" },
};

export default function DigitalTwinFloor() {
  const { tables, selectedTableId, setSelectedTableId, clearTable } = usePulseStore();
  const selectedTable = tables.find((table) => table.id === selectedTableId) || tables[0];
  const activeTables = tables.filter((table) => table.status !== "available").length;
  return <section className="surface overflow-hidden"><header className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Restaurant floor</p><h2 className="mt-1 text-lg font-semibold tracking-tight">See every table at a glance</h2><p className="mt-1 text-sm text-slate-600">Choose a table to inspect or close its visit.</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">{activeTables} of {tables.length} in service</span></header><div className="p-5"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="mb-4 flex items-center justify-between border-b border-dashed border-slate-300 pb-3 text-xs font-medium uppercase tracking-wider text-slate-500"><span>Entrance</span><span>Kitchen pass</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{tables.map((table) => { const config = styles[table.status]; const selected = selectedTable?.id === table.id; return <button key={table.id} onClick={() => setSelectedTableId(table.id)} className={`min-h-28 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${config.border} ${config.background} ${selected ? "ring-2 ring-slate-900 ring-offset-2" : ""}`}><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-950">Table {table.table_number}</span><span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} /></div><div className="mt-4 flex items-center gap-1.5 text-xs text-slate-600"><Users className="h-3.5 w-3.5" />{table.capacity} seats</div><p className="mt-2 text-xs font-medium text-slate-700">{config.label}{table.bill_amount ? ` • ₹${table.bill_amount.toLocaleString()}` : ""}</p></button>; })}</div></div>{selectedTable && <aside className="mt-4 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-slate-900">Table {selectedTable.table_number}</p><p className="mt-1 text-sm text-slate-600">{styles[selectedTable.status].label}{selectedTable.bill_amount ? ` • Current bill ₹${selectedTable.bill_amount.toLocaleString()}` : " • Ready for guests"}</p></div>{(selectedTable.status === "needs_cleaning" || selectedTable.bill_amount > 0) && <button onClick={() => clearTable(selectedTable.id)} className="button-secondary">{selectedTable.status === "needs_cleaning" ? <Check className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}{selectedTable.status === "needs_cleaning" ? "Mark table clean" : "Close visit"}</button>}</aside>}</div></section>;
}
