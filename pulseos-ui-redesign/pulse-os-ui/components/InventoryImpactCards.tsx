"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel, PanelHead, Tag, type Tone } from "@/components/ui/primitives";

function severity(stock: number, min: number): { tone: Tone; label: string; bar: string } {
  if (stock <= min * 0.6) return { tone: "risk", label: "Act now", bar: "oklch(69% 0.165 26)" };
  if (stock <= min) return { tone: "busy", label: "Watch", bar: "oklch(80% 0.130 74)" };
  return { tone: "ok", label: "Fine", bar: "oklch(76% 0.125 156)" };
}

export default function InventoryImpactCards() {
  const inventory = usePulseStore((s) => s.inventory);

  return (
    <Panel>
      <PanelHead title="Stock decisions" sub="needs a call in the next hour" />
      {inventory.map((i) => {
        const sev = severity(i.current_stock, i.min_threshold);
        // NaN guard: min_threshold can legitimately be 0 on a new item.
        const pct = Math.max(
          4,
          Math.min(100, (i.current_stock / Math.max(0.001, i.min_threshold)) * 100)
        );
        return (
          <div key={i.id} className="border-b border-line-soft px-5 py-4 last:border-b-0">
            <div className="mb-2.5 flex items-baseline gap-3">
              <h4 className="text-sm font-semibold">{i.name}</h4>
              <Tag tone={sev.tone}>{sev.label}</Tag>
              <span className="num ml-auto text-xs text-ink-subtle">
                {i.current_stock} {i.unit} / {i.min_threshold} min
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-sm bg-obsidian-700">
              <span
                className="block h-full rounded-sm transition-[width] duration-700 ease-out-expo"
                style={{ width: `${pct}%`, background: sev.bar }}
              />
            </div>
            <small className="mt-2 block text-xs text-ink-subtle">
              Runs out in {i.est_runout_mins} min
              {i.potential_loss > 0
                ? ` · ₹${i.potential_loss.toLocaleString("en-IN")} exposed`
                : " · no exposure"}
            </small>
          </div>
        );
      })}
    </Panel>
  );
}
