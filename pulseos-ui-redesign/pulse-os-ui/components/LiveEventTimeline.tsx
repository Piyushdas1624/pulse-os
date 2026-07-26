"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel, PanelHead, EmptyState, cx } from "@/components/ui/primitives";
import type { LiveEvent } from "@/lib/types/pulse";

const DOT: Record<LiveEvent["severity"], string> = {
  info: "bg-ink-subtle",
  success: "bg-state-ok",
  warning: "bg-state-busy",
  danger: "bg-state-risk",
};

export default function LiveEventTimeline({ limit = 8 }: { limit?: number }) {
  const liveEvents = usePulseStore((s) => s.liveEvents);
  const rows = liveEvents.slice(0, limit);

  return (
    <Panel>
      <PanelHead title="Live feed" sub="newest first" />
      {rows.length === 0 ? (
        <EmptyState title="Quiet service" hint="Orders, kitchen moves and AI actions land here as they happen." />
      ) : (
        <div className="py-2">
          {rows.map((e, i) => (
            <div key={e.id} className="grid grid-cols-[56px_12px_1fr] items-start gap-3 px-5 py-3">
              <time className="num pt-0.5 text-xs text-ink-subtle">{e.timestamp}</time>
              <div className="relative pt-2">
                <span className={cx("block h-[7px] w-[7px] rounded-full", DOT[e.severity])} />
                {i < rows.length - 1 && (
                  <span className="absolute left-[3px] top-[18px] block w-px bg-line" style={{ height: "calc(100% + 4px)" }} />
                )}
              </div>
              <div>
                <p className="text-sm leading-snug">{e.description}</p>
                <small className="mt-0.5 block text-xs text-ink-subtle">
                  {e.type}
                  {e.table_number ? ` · table ${e.table_number}` : ""}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
