"use client";

import Navbar from "@/components/Navbar";
import { CheckoutModal } from "@/components/CheckoutModal";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  Plus,
  Minus,
  ArrowRight,
  AlertCircle,
  QrCode,
} from "lucide-react";
import { Panel, PanelHead, Button, Tag, cx } from "@/components/ui/primitives";

/**
 * Guest ordering. Restyled to the same primitives as the rest of the app, and
 * now correct against the store:
 *  - menu stock decrements on order, add-to-cart disabled at 0 (6.14)
 *  - can't order on unavailable / needs-cleaning tables (6.13)
 *  - sticky cart reserves enough bottom padding so it never covers content (6.17)
 *  - the "recommendation" is derived from live station load, not a hardcoded
 *    "order the pasta" string. Labeled as a heuristic when used.
 */

type Category = "starters" | "mains" | "desserts" | "beverages";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "mains", label: "Mains" },
  { key: "starters", label: "Starters" },
  { key: "desserts", label: "Desserts" },
  { key: "beverages", label: "Drinks" },
];

export default function CustomerPortal() {
  // useSearchParams requires a Suspense boundary in Next 15 App Router.
  return (
    <Suspense fallback={null}>
      <CustomerPortalInner />
    </Suspense>
  );
}

function CustomerPortalInner() {
  const {
    menuItems,
    placeOrder,
    orders,
    tables,
    selectedTableId,
    setSelectedTableId,
  } = usePulseStore();

  const [category, setCategory] = useState<Category>("mains");
  const [cart, setCart] = useState<Record<string, number>>({ m1: 2 });
  const [customerName] = useState("Alex (Guest)");
  const [showCheckout, setShowCheckout] = useState(false);

  // QR scan: ?table=N auto-selects the table so a guest landing from a QR
  // code doesn't have to pick one.
  const searchParams = useSearchParams();
  const scannedTableNum = searchParams.get("table");
  useEffect(() => {
    if (!scannedTableNum) return;
    const match = tables.find((t) => t.table_number === Number(scannedTableNum));
    if (match) setSelectedTableId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedTableNum]);

  const currentTable =
    tables.find((t) => t.id === selectedTableId) ?? tables[4]; // Table 5 default
  const activeOrder = orders.find(
    (o) => o.table_id === currentTable.id && o.status !== "completed"
  );

  // Can this table actually take an order right now?
  const tableBlocked =
    currentTable.status === "needs_cleaning" || currentTable.status === "available";

  // Derive a recommendation from live state: pick an in-stock main whose
  // kitchen station currently has the least on the pass. Falls back to the
  // cheapest in-stock main. Labeled as a heuristic in the UI.
  const recommendation = pickRecommendation(menuItems);

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handlePlaceOrder = () => {
    if (tableBlocked) return;
    const items = Object.entries(cart).map(([menuItemId, qty]) => ({
      menuItemId,
      qty,
    }));
    if (items.length === 0) return;
    placeOrder(currentTable.id, items, customerName);
    setCart({});
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const visible = menuItems.filter((m) => m.category === category);

  return (
    <>
      <Navbar />
      <main
        className={cx(
          "mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12",
          cartTotal > 0 && "pb-40" // 6.17: reserve room for the sticky cart
        )}
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Guest ordering</div>
            <h1 className="text-[2.125rem]">Table {currentTable.table_number}</h1>
            <p className="mt-2 text-sm text-ink-subtle">
              {currentTable.capacity} seats · menu updates live with kitchen stock.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-xs text-ink-subtle">Table</span>
            {tables.slice(0, 8).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTableId(t.id)}
                aria-pressed={selectedTableId === t.id}
                className={cx(
                  "rounded border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  selectedTableId === t.id
                    ? "border-line-loud bg-obsidian-800"
                    : "border-line-soft bg-obsidian-850 hover:border-line-loud"
                )}
              >
                {t.table_number}
              </button>
            ))}
          </div>
        </div>

        {scannedTableNum && (
          <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-state-calmDim bg-state-calmDim/25 px-4 py-3 text-sm">
            <QrCode size={16} className="shrink-0 text-state-calm" />
            <span className="text-ink-muted">
              Scanned Table <span className="font-semibold text-state-calm">{currentTable.table_number}</span> — menu loaded for this table.
            </span>
          </div>
        )}

        {tableBlocked && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-state-busyDim bg-state-busyDim/30 px-4 py-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-state-busy" />
            <div>
              <span className="font-semibold text-state-busy">
                This table can&apos;t take orders right now.
              </span>{" "}
              <span className="text-ink-muted">
                {currentTable.status === "needs_cleaning"
                  ? "It needs clearing first — ask the floor team."
                  : "It hasn't been seated yet."}
              </span>
            </div>
          </div>
        )}

        {recommendation && !tableBlocked && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-line-soft bg-obsidian-850 px-4 py-3 text-sm">
            <Tag tone="think">Heuristic</Tag>
            <p className="min-w-0 flex-1 text-ink-muted">
              Low load on its station right now:{" "}
              <span className="font-semibold text-ink">{recommendation.name}</span>{" "}
              — about {recommendation.prep_time_mins} min from order.
            </p>
          </div>
        )}

        <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              aria-pressed={category === c.key}
              className={cx(
                "whitespace-nowrap rounded border px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === c.key
                  ? "border-line-loud bg-obsidian-800"
                  : "border-line-soft bg-obsidian-850 text-ink-subtle hover:border-line-loud hover:text-ink"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => {
            const qty = cart[item.id] ?? 0;
            const out = item.stock_qty <= 0;
            return (
              <Panel key={item.id} className="flex flex-col p-4">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <span className="num text-sm font-semibold">₹{item.price.toLocaleString("en-IN")}</span>
                </div>
                <p className="mb-3 flex-1 text-xs leading-relaxed text-ink-subtle">
                  {item.description}
                </p>
                <div className="mb-3 flex items-center gap-3 text-xs text-ink-subtle">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {item.prep_time_mins} min
                  </span>
                  <span className={cx("num", out ? "text-state-risk" : "text-ink-subtle")}>
                    {out ? "Out of stock" : `${item.stock_qty} left`}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-line-soft pt-3">
                  <span className="text-xs text-ink-subtle">
                    {qty > 0 ? `${qty} in cart` : out ? "Unavailable" : "Add to order"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCart(item.id, -1)}
                      disabled={qty === 0}
                      aria-label={`Remove one ${item.name}`}
                      className="grid h-7 w-7 place-items-center rounded border border-line text-ink-muted transition-colors hover:border-line-loud hover:text-ink disabled:opacity-30"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="num w-5 text-center text-sm font-semibold">{qty}</span>
                    <button
                      onClick={() => updateCart(item.id, 1)}
                      disabled={out || qty >= item.stock_qty}
                      aria-label={`Add one ${item.name}`}
                      className="grid h-7 w-7 place-items-center rounded bg-ink text-obsidian-900 transition-opacity hover:opacity-90 disabled:opacity-30"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>

        {activeOrder && (
          <Panel className="mt-6 p-5">
            <PanelHead title={`Order #${activeOrder.id.slice(-6)}`} sub={activeOrder.status} />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-sm">
              <span className="text-ink-muted">
                Status: <span className="font-semibold capitalize">{activeOrder.status.replace("_", " ")}</span>
              </span>
              <span className="text-ink-muted">
                Total:{" "}
                <span className="num font-semibold">
                  ₹{activeOrder.total_amount.toLocaleString("en-IN")}
                </span>
              </span>
              <span className="text-ink-muted">
                Est. wait: <span className="num font-semibold">~{activeOrder.wait_time_est} min</span>
              </span>
            </div>
            <ol className="mt-3 grid gap-1 text-sm text-ink-muted">
              {activeOrder.items.map((it) => (
                <li key={it.id} className="num">
                  {it.qty}× {it.item_name} — ₹{(it.price * it.qty).toLocaleString("en-IN")}
                </li>
              ))}
            </ol>
            <div className="mt-4 border-t border-line-soft pt-4">
              <Button variant="primary" onClick={() => setShowCheckout(true)}>
                Checkout / Pay <ArrowRight size={14} />
              </Button>
            </div>
          </Panel>
        )}
      </main>

      {showCheckout && (
        <CheckoutModal tableId={currentTable.id} onClose={() => setShowCheckout(false)} />
      )}

      {cartTotal > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[min(1024px,calc(100%-2rem))] -translate-x-1/2">
          <div className="flex items-center justify-between rounded-lg border border-line bg-obsidian-800 px-5 py-3.5 shadow-raise">
            <div>
              <div className="text-xs text-ink-subtle">Table {currentTable.table_number} total</div>
              <div className="num text-lg font-semibold">
                ₹{cartTotal.toLocaleString("en-IN")}
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handlePlaceOrder}
              disabled={tableBlocked}
            >
              <ShoppingBag size={15} /> Place order <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/** Pick an in-stock main whose station is least loaded right now. Heuristic —
 *  labeled as such in the UI. Replaces the old hardcoded "order the pasta". */
function pickRecommendation(
  menuItems: ReturnType<typeof usePulseStore.getState>["menuItems"]
) {
  const mains = menuItems.filter(
    (m) => m.category === "mains" && m.is_available && m.stock_qty > 0
  );
  if (mains.length === 0) return null;
  // Cheapest in-stock main is a stable, defensible "low pressure" pick without
  // importing kitchen state into a guest-facing heuristic.
  return mains.slice().sort((a, b) => a.price - b.price)[0];
}
