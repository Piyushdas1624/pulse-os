"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel, PanelHead, Button, Tag, EmptyState } from "@/components/ui/primitives";
import { toast } from "@/components/ui/Toast";

export default function KitchenCPUScheduler() {
  const { kitchenQueue, advanceKitchenTicket } = usePulseStore();
  const stations = Array.from(new Set(kitchenQueue.map((t) => t.station)));

  return (
    <Panel>
      <PanelHead title="Kitchen queue" sub="grouped by station" />

      {kitchenQueue.length === 0 ? (
        <EmptyState
          title="Nothing on the pass"
          hint="Tickets appear here the moment a table orders. Batched dishes group automatically."
        />
      ) : (
        stations.map((station) => (
          <div key={station}>
            <div className="eyebrow px-5 pb-1 pt-3">{station}</div>
            {kitchenQueue
              .filter((t) => t.station === station)
              .map((t) => {
                const ready = t.status === "ready";
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <h4
                        className={
                          ready
                            ? "flex items-center gap-2 text-sm font-semibold text-ink-subtle line-through"
                            : "flex items-center gap-2 text-sm font-semibold"
                        }
                      >
                        <span className="num">{t.qty}&times;</span> {t.dish_name}
                        {t.prep_priority === "batched" && <Tag tone="think">Batched</Tag>}
                        {t.prep_priority === "high" && <Tag tone="busy">Priority</Tag>}
                      </h4>
                      <small className="text-xs text-ink-subtle">
                        Table {t.table_numbers.join(" + ")} &middot;{" "}
                        {ready ? "ready on the pass" : `fired ${t.created_at}`}
                      </small>
                    </div>
                    <div className="ml-auto shrink-0">
                      {ready ? (
                        <Tag tone="ok">Ready</Tag>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            advanceKitchenTicket(t.id);
                            toast(
                              `${t.dish_name} up. Table ${t.table_numbers.join(" + ")} notified.`
                            );
                          }}
                        >
                          Mark ready
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ))
      )}
    </Panel>
  );
}
