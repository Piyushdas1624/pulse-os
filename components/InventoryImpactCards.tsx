"use client";

import { useEffect, useState } from "react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel, PanelHead, Tag, cx, type Tone } from "@/components/ui/primitives";

function severity(stock: number, min: number): { tone: Tone; label: string; bar: string } {
  if (stock <= min * 0.6) return { tone: "risk", label: "Act now", bar: "oklch(69% 0.165 26)" };
  if (stock <= min) return { tone: "busy", label: "Watch", bar: "oklch(80% 0.130 74)" };
  return { tone: "ok", label: "Fine", bar: "oklch(76% 0.125 156)" };
}

/** Live mm:ss countdown from an est_runout_mins baseline. Urgency
 *  amplification: a ticking number reads as a real deadline, not an estimate. */
function Countdown({ minutes }: { minutes: number }) {
  const [secs, setSecs] = useState(Math.max(0, Math.round(minutes * 60)));
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const critical = secs <= 600; // last 10 min -> red pulse
  return (
    <span className={cx("num tabular-nums", critical && "text-state-risk")}>
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}

export default function InventoryImpactCards() {
  const inventory = usePulseStore((s) => s.inventory);
  // The single most-critical item gets the live countdown (Von Restorff).
  const criticalId = [...inventory].sort((a, b) => a.est_runout_mins - b.est_runout_mins)[0]?.id;

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
        const isCritical = i.id === criticalId;
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
              {isCritical ? (
                <>
                  Runs out in <Countdown minutes={i.est_runout_mins} /> min
                </>
              ) : (
                <>Runs out in {i.est_runout_mins} min</>
              )}
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
