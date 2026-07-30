"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, Banknote, Check, Receipt as ReceiptIcon } from "lucide-react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { PaymentInfo } from "@/lib/types/pulse";
import { Button, cx } from "@/components/ui/primitives";
import { RewardOffer } from "@/components/RewardOffer";

const GST_RATE = 0.18;
const TIP_PRESETS = [10, 15, 18, 20];

type Stage = "review" | "processing" | "done";

export function CheckoutModal({ tableId, onClose }: { tableId: string; onClose: () => void }) {
  const { tables, orders, checkoutTable } = usePulseStore();
  const table = tables.find((t) => t.id === tableId);

  const openOrder = orders.find(
    (o) => o.table_id === tableId && o.status !== "completed" && o.status !== "cancelled"
  );

  // Line items: prefer the open order, fall back to the table's bill total.
  const lines = useMemo(() => {
    if (openOrder) {
      return openOrder.items.map((i) => ({ name: i.item_name, qty: i.qty, price: i.price }));
    }
    return table ? [{ name: "Table bill", qty: 1, price: table.bill_amount }] : [];
  }, [openOrder, table]);

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0) || table?.bill_amount || 0;
  const taxAmount = Math.round(subtotal * GST_RATE);

  const [tipPercent, setTipPercent] = useState(15); // anchoring: 15% pre-selected
  const [customTip, setCustomTip] = useState<string>("");
  const [method, setMethod] = useState<PaymentInfo["method"]>("upi");
  const [stage, setStage] = useState<Stage>("review");

  const tipAmount = customTip
    ? Number(customTip) || 0
    : Math.round(subtotal * (tipPercent / 100));
  const grandTotal = subtotal + taxAmount + tipAmount;

  if (!table) return null;

  const handlePay = () => {
    setStage("processing");
    // Goal-gradient: a real-feeling ~4s progress, then confirm.
    setTimeout(() => {
      const payment: PaymentInfo = {
        method,
        subtotal,
        tax_amount: taxAmount,
        tip_amount: tipAmount,
        tip_percent: customTip ? 0 : tipPercent,
        grand_total: grandTotal,
        status: "paid",
        paid_at: new Date().toISOString(),
      };
      checkoutTable(tableId, payment);
      setStage("done");
    }, 4000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-lg border border-line bg-obsidian-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <h2 className="text-base font-semibold">
            {stage === "done" ? "Payment complete" : `Checkout · Table ${table.table_number}`}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-subtle hover:bg-obsidian-800 hover:text-ink"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ---- DONE (peak-end) ---- */}
        {stage === "done" ? (
          <div className="px-5 py-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                className="grid h-16 w-16 place-items-center rounded-full bg-state-okDim text-state-ok"
              >
                <Check size={32} />
              </motion.span>
              <h3 className="text-lg font-semibold">Thank you!</h3>
              <p className="text-sm text-ink-muted">
                Paid <span className="font-semibold text-ink">₹{grandTotal.toLocaleString("en-IN")}</span> via{" "}
                {method.toUpperCase()}
              </p>
            </div>

            {/* Confetti burst */}
            <Confetti />

            <RewardOffer totalPaid={grandTotal} />

            <div className="mt-5 flex gap-3">
              <Button variant="ghost" className="flex-1 justify-center" onClick={handlePrint}>
                <ReceiptIcon size={15} /> Receipt
              </Button>
              <Button variant="primary" className="flex-1 justify-center" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5">
            {/* Line items */}
            <ul className="mb-3 space-y-2">
              {lines.map((l, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-ink-muted">
                    <span className="font-medium text-ink">{l.qty}x</span> {l.name}
                  </span>
                  <span className="font-medium">₹{(l.price * l.qty).toLocaleString("en-IN")}</span>
                </li>
              ))}
              {lines.length === 0 && (
                <li className="text-sm text-ink-subtle">No items on this bill.</li>
              )}
            </ul>

            <div className="space-y-1.5 border-t border-line-soft pt-3 text-sm">
              <Row label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
              <Row label="GST (18%)" value={`₹${taxAmount.toLocaleString("en-IN")}`} muted />
            </div>

            {/* Tip — anchoring via 15% default */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Add a tip
                </span>
                <span className="text-xs text-ink-subtle">100% goes to your server</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TIP_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setTipPercent(p);
                      setCustomTip("");
                    }}
                    className={cx(
                      "rounded-md border py-2 text-sm font-semibold transition-colors",
                      !customTip && tipPercent === p
                        ? "border-ink bg-ink text-obsidian-900"
                        : "border-line-soft bg-obsidian-800 text-ink-muted hover:border-line"
                    )}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="number"
                  min={0}
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder="Custom ₹"
                  className="w-full rounded-md border border-line-soft bg-obsidian-800 px-3 py-2 text-sm focus:border-ink focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 space-y-1.5 border-t border-line-soft pt-3 text-sm">
              <Row label="Tip" value={`₹${tipAmount.toLocaleString("en-IN")}`} muted />
              <div className="flex justify-between pt-1">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-semibold">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="mt-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                Pay via
              </span>
              <div className="grid grid-cols-3 gap-2">
                <MethodBtn active={method === "upi"} onClick={() => setMethod("upi")} icon={<Smartphone size={15} />} label="UPI QR" />
                <MethodBtn active={method === "card"} onClick={() => setMethod("card")} icon={<CreditCard size={15} />} label="Card" />
                <MethodBtn active={method === "cash"} onClick={() => setMethod("cash")} icon={<Banknote size={15} />} label="Cash" />
              </div>
            </div>

            {/* Pay / processing */}
            <Button
              variant="primary"
              className="mt-5 w-full justify-center"
              disabled={stage === "processing" || subtotal === 0}
              onClick={handlePay}
            >
              {stage === "processing" ? (
                <ProcessingBar />
              ) : (
                `Pay ₹${grandTotal.toLocaleString("en-IN")}`
              )}
            </Button>
            <p className="mt-2 text-center text-xs text-ink-subtle">
              Simulated payment for the demo — no card charged.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-ink-subtle" : "text-ink-muted"}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MethodBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex flex-col items-center gap-1 rounded-md border py-2.5 text-xs font-medium transition-colors",
        active
          ? "border-ink bg-obsidian-800 text-ink"
          : "border-line-soft bg-obsidian-850 text-ink-subtle hover:border-line hover:text-ink-muted"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/** 4s goal-gradient bar shown inside the Pay button while "processing". */
function ProcessingBar() {
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-2 w-24 overflow-hidden rounded-full bg-obsidian-700">
        <motion.span
          className="absolute inset-y-0 left-0 bg-obsidian-900"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
      </span>
      Processing…
    </span>
  );
}

/** Lightweight confetti burst rendered behind the success check. */
function Confetti() {
  const pieces = Array.from({ length: 18 });
  const colors = ["#10b981", "#f59e0b", "#3b82f6", "#a855f7", "#ef4444"];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-center">
      {pieces.map((_, i) => {
        const x = (Math.random() - 0.5) * 320;
        const delay = Math.random() * 0.2;
        const color = colors[i % colors.length];
        return (
          <motion.span
            key={i}
            className="absolute h-2 w-1 rounded-full"
            style={{ background: color }}
            initial={{ y: 0, x: 0, opacity: 1 }}
            animate={{ y: -120 - Math.random() * 40, x, opacity: 0, rotate: Math.random() * 360 }}
            transition={{ duration: 1.1, delay, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
