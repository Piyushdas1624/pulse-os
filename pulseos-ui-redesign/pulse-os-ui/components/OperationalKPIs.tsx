"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { StatStrip, Stat, Gauge } from "@/components/ui/primitives";

/**
 * Every number below is computed from the store. Nothing is a placeholder.
 * If a value cannot be derived, it is not shown.
 */
export default function OperationalKPIs() {
  const { tables, kitchenQueue, inventory, getComputedHealthScore, getComputedOpportunity } =
    usePulseStore();

  const health = getComputedHealthScore();
  const openBill = tables.reduce((sum, t) => sum + t.bill_amount, 0);
  const seated = tables.filter((t) => t.status !== "available").length;
  const cooking = kitchenQueue.filter((k) => k.status === "cooking").length;
  const batched = kitchenQueue.filter((k) => k.prep_priority === "batched").length;
  const atRisk = inventory.filter((i) => i.current_stock <= i.min_threshold).length;

  return (
    <StatStrip>
      <Stat label="Restaurant health" value={health}>
        <Gauge value={health} tone={health >= 80 ? "ok" : "busy"} />
      </Stat>
      <Stat
        label="Open on floor"
        value={`₹${openBill.toLocaleString("en-IN")}`}
        delta={`${seated} of ${tables.length} seated`}
      />
      <Stat
        label="Kitchen tickets"
        value={cooking}
        delta={batched ? `${batched} batched` : "none batched"}
      />
      <Stat
        label="Upside identified"
        value={`₹${getComputedOpportunity().toLocaleString("en-IN")}`}
        delta={atRisk ? `${atRisk} stock risk` : "stock clear"}
        deltaTone={atRisk ? "down" : "up"}
      />
    </StatStrip>
  );
}
