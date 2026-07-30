"use client";

import Navbar from "@/components/Navbar";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ReservationSection } from "@/components/ReservationSection";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Clock,
  Plus,
  Minus,
  ArrowRight,
  AlertCircle,
  QrCode,
  Check,
  User,
  ExternalLink,
  Store,
} from "lucide-react";
import { Panel, PanelHead, Button, Tag, cx } from "@/components/ui/primitives";
import Link from "next/link";

/**
 * Guest ordering page — restyled with:
 *  - Menu item images
 *  - Waiter assignment display
 *  - Reviews & Reservations sections
 *  - URL ?table=N sync (reads AND writes)
 *  - All orders accumulated in active order view
 *  - 12-hour time format throughout
 */

type Category = "starters" | "mains" | "desserts" | "beverages";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "mains", label: "Mains" },
  { key: "starters", label: "Starters" },
  { key: "desserts", label: "Desserts" },
  { key: "beverages", label: "Drinks" },
];

export default function CustomerPortal() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="h-screen" />}>
        <CustomerPortalInner />
      </Suspense>
    </>
  );
}

function CustomerPortalInner() {
  const {
    menuItems,
    placeOrder,
    orders,
    tables,
    staff,
    selectedTableId,
    setSelectedTableId,
    seatTable,
  } = usePulseStore();

  const router = useRouter();
  const [category, setCategory] = useState<Category>("mains");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName] = useState("Alex (Guest)");
  const [showCheckout, setShowCheckout] = useState(false);
  const [justOrdered, setJustOrdered] = useState(false);

  const searchParams = useSearchParams();
  const scannedTableNum = searchParams.get("table");

  // Sync table from URL param on mount
  useEffect(() => {
    if (!scannedTableNum) return;
    const match = tables.find((t) => t.table_number === Number(scannedTableNum));
    if (match) setSelectedTableId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedTableNum]);

  // Default to first available table (not pre-occupied by demo data)
  const firstAvailable = tables.find((t) => t.status === "available") ?? tables[0];
  const currentTable =
    tables.find((t) => t.id === selectedTableId) ?? firstAvailable;

  // Only show orders placed this session (exclude seeded demo orders)
  const tableOrders = orders.filter(
    (o) =>
      o.table_id === currentTable.id &&
      o.status !== "completed" &&
      o.status !== "cancelled" &&
      !o.id.startsWith("ord-demo") // skip seed data
  );
  const activeOrder = tableOrders[0]; // for status display

  // Merge all items from all open orders into one combined list
  const allOrderedItems = tableOrders.flatMap((o) => o.items);
  const allOrdersTotal = tableOrders.reduce((s, o) => s + o.total_amount, 0);

  const tableBlocked =
    currentTable.status === "needs_cleaning" || currentTable.status === "available";

  // Find assigned waiter for this table
  const waiters = staff.filter(
    (s) => s.role === "floor_waiter" || s.role === "floor_captain"
  );
  // First try assigned_waiter_id, then fall back to round-robin
  const assignedWaiter =
    currentTable.assigned_waiter_id
      ? staff.find((s) => s.id === currentTable.assigned_waiter_id)
      : waiters.length > 0
      ? waiters[(currentTable.table_number - 1) % waiters.length]
      : null;

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
    setJustOrdered(true);
    setTimeout(() => setJustOrdered(false), 1800);
  };

  // Switch table, seat it, and update URL
  const handleTableSelect = (tableId: string, tableNumber: number) => {
    setSelectedTableId(tableId);
    // Seat the table → owner sees it go from 'available' to 'occupied' in real-time
    seatTable(tableId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("table", String(tableNumber));
      window.history.replaceState({}, "", url.toString());
    }
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const visible = menuItems.filter((m) => m.category === category);

  return (
    <>
      <AnimatePresence>
        {justOrdered && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-obsidian-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              className="grid h-20 w-20 place-items-center rounded-full bg-state-okDim text-state-ok"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <Check size={40} />
            </motion.span>
            <motion.p
              className="mt-4 text-lg font-semibold"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Order confirmed!
            </motion.p>
            <p className="text-sm text-ink-subtle">The kitchen just got your ticket.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <main
        className={cx(
          "mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12",
          cartTotal > 0 && "pb-40"
        )}
      >
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Guest ordering</div>
            <h1 className="text-[2.125rem]">Table {currentTable.table_number}</h1>
            <p className="mt-2 text-sm text-ink-subtle">
              {currentTable.capacity} seats · menu updates live with kitchen stock.
            </p>
            {/* Restaurant link */}
            <Link
              href="/restaurant"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-subtle hover:text-ink transition-colors"
            >
              <Store size={12} />
              View restaurant · 360° tour &amp; info
              <ExternalLink size={10} />
            </Link>
          </div>

          {/* Table switcher */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-xs text-ink-subtle">Table</span>
            {tables.slice(0, 8).map((t) => (
              <button
                key={t.id}
                onClick={() => handleTableSelect(t.id, t.table_number)}
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

        {/* QR scan notice */}
        {scannedTableNum && (
          <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-state-calmDim bg-state-calmDim/25 px-4 py-3 text-sm">
            <QrCode size={16} className="shrink-0 text-state-calm" />
            <span className="text-ink-muted">
              Scanned Table <span className="font-semibold text-state-calm">{currentTable.table_number}</span> — menu loaded for this table.
            </span>
          </div>
        )}

        {/* Waiter assignment badge */}
        {assignedWaiter && (
          <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-line-soft bg-obsidian-850 px-4 py-3 text-sm">
            <User size={15} className="shrink-0 text-ink-subtle" />
            <span className="text-ink-muted">
              Your waiter today:{" "}
              <span className="font-semibold text-ink">{assignedWaiter.full_name}</span>
              {assignedWaiter.shift_status === "on_duty" ? (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-state-okDim px-2 py-0.5 text-[10px] font-semibold text-state-ok">
                  On duty
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-obsidian-800 px-2 py-0.5 text-[10px] font-semibold text-ink-subtle">
                  {assignedWaiter.shift_status}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Table blocked warning */}
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

        {/* Category tabs */}
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

        {/* Menu grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => {
            const qty = cart[item.id] ?? 0;
            const out = item.stock_qty <= 0;
            return (
              <Panel key={item.id} className="flex flex-col overflow-hidden p-0">
                {/* Item image */}
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex flex-1 flex-col p-4">
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
                </div>
              </Panel>
            );
          })}
        </div>

        {/* Active orders panel — shows ALL orders merged */}
        {tableOrders.length > 0 && (
          <Panel className="mt-6 p-5">
            <PanelHead
              title={`Order${tableOrders.length > 1 ? "s" : ""} for Table ${currentTable.table_number}`}
              sub={`${tableOrders.length} order${tableOrders.length > 1 ? "s" : ""} · ${activeOrder?.status.replace("_", " ") ?? ""}`}
            />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-sm">
              <span className="text-ink-muted">
                Status: <span className="font-semibold capitalize">{activeOrder?.status.replace("_", " ")}</span>
              </span>
              <span className="text-ink-muted">
                Running total:{" "}
                <span className="num font-semibold">
                  ₹{allOrdersTotal.toLocaleString("en-IN")}
                </span>
              </span>
              {activeOrder && (
                <span className="text-ink-muted">
                  Est. wait: <span className="num font-semibold">~{activeOrder.wait_time_est} min</span>
                </span>
              )}
            </div>
            {/* All items merged */}
            <ol className="mt-3 grid gap-1 text-sm text-ink-muted">
              {allOrderedItems.map((it) => (
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

        {/* Reviews */}
        <ReviewsSection tableNumber={currentTable.table_number} />

        {/* Reservations */}
        <ReservationSection />
      </main>

      {showCheckout && (
        <CheckoutModal tableId={currentTable.id} onClose={() => setShowCheckout(false)} />
      )}

      {/* Sticky cart bar */}
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

function pickRecommendation(
  menuItems: ReturnType<typeof usePulseStore.getState>["menuItems"]
) {
  const mains = menuItems.filter(
    (m) => m.category === "mains" && m.is_available && m.stock_qty > 0
  );
  if (mains.length === 0) return null;
  return mains.slice().sort((a, b) => a.price - b.price)[0];
}
