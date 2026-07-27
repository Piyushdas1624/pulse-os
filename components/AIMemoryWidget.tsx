"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel, PanelHead, cx } from "@/components/ui/primitives";
import { TrendingDown, TrendingUp } from "lucide-react";

/**
 * Memory log of applied AI actions and their outcome deltas. Same primitives
 * as the rest of the app. Delta is signed: negative = improvement (e.g. wait
 * time down), positive = increase (e.g. check size up).
 */
export default function AIMemoryWidget() {
  const aiMemory = usePulseStore((s) => s.aiMemory);

  return (
    <Panel>
      <PanelHead title="Applied actions" sub="tracked outcomes" />
      {aiMemory.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-subtle">
          No actions applied yet. Apply an audit recommendation and the outcome lands here.
        </p>
      ) : (
        <div className="divide-y divide-line-soft">
          {aiMemory.map((item) => {
            const down = item.delta_pct < 0;
            return (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold">{item.title}</h4>
                  <p className="mt-0.5 truncate text-xs text-ink-subtle">{item.action_taken}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[11px] text-ink-subtle">{item.outcome_metric}</div>
                  <div
                    className={cx(
                      "num flex items-center justify-end gap-1 text-sm font-semibold",
                      down ? "text-state-ok" : "text-state-calm"
                    )}
                  >
                    {down ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                    {item.delta_pct > 0 ? `+${item.delta_pct}%` : `${item.delta_pct}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
