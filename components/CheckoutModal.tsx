"use client";
import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, Banknote, Check, Receipt as ReceiptIcon, QrCode, AlertCircle, CheckCircle2 } from "lucide-react";
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

  const openOrders = orders.filter(
    (o) => o.table_id === tableId && o.status !== "completed" && o.status !== "cancelled"
  );

  // Line items: merge items from ALL non-completed orders for the tableId.
  const lines = useMemo(() => {
    if (openOrders.length > 0) {
      const merged: Record<string, { name: string; qty: number; price: number }> = {};
      openOrders.forEach(order => {
        order.items.forEach(item => {
          if (merged[item.item_name]) {
            merged[item.item_name].qty += item.qty;
          } else {
            merged[item.item_name] = { name: item.item_name, qty: item.qty, price: item.price };
          }
        });
      });
      return Object.values(merged);
    }
    return table ? [{ name: "Table bill", qty: 1, price: table.bill_amount }] : [];
  }, [openOrders, table]);

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0) || table?.bill_amount || 0;
  const taxAmount = Math.round(subtotal * GST_RATE);

  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState<string>("");
  const [method, setMethod] = useState<PaymentInfo["method"]>("upi");
  const [stage, setStage] = useState<Stage>("review");

  // Card input states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const tipAmount = customTip
    ? Number(customTip) || 0
    : Math.round(subtotal * (tipPercent / 100));
  const grandTotal = subtotal + taxAmount + tipAmount;
  
  const paymentRef = useRef<PaymentInfo | null>(null);

  const isLuhnValid = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13) return false;
    let sum = 0;
    let isSecond = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits[i], 10);
      if (isSecond) {
        d = d * 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      isSecond = !isSecond;
    }
    return sum % 10 === 0;
  }, [cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    setCardExpiry(val);
  };

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
        paid_at: new Date().toLocaleString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }),
      };
      paymentRef.current = payment;
      checkoutTable(tableId, payment);
      setStage("done");
    }, 4000);
  };

  const handlePrint = () => window.print();

  const isPayDisabled = stage === "processing" || subtotal === 0 || (method === "card" && !isLuhnValid);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md my-8 rounded-lg border border-line bg-obsidian-900 shadow-2xl"
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
        {stage === "done" && paymentRef.current ? (
          <div className="px-5 py-6">
            
            {/* Professional Thermal Receipt */}
            <div className="bg-white text-gray-900 rounded-sm p-6 shadow-sm font-mono text-sm relative overflow-hidden mb-6">
              {/* Receipt zig-zag top and bottom effect could go here, for now use standard rounded */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-xl uppercase tracking-widest">Saffron & Smoke</h3>
                <p className="text-xs text-gray-600">Modern Indian Cuisine</p>
                <p className="text-xs text-gray-600 mt-1">123 Culinary Avenue, Food District</p>
                <p className="text-xs text-gray-600">Ph: +91 98765 43210</p>
                <p className="text-xs text-gray-600">GSTIN: 22AAAAA0000A1Z5</p>
              </div>
              
              <div className="border-t-[1.5px] border-dashed border-gray-300 py-3 my-3">
                <div className="flex justify-between">
                  <span>Table: {table.table_number}</span>
                  <span>Order: #{openOrders[0]?.id?.slice(0,6).toUpperCase() || 'WALKIN'}</span>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Date:</span>
                  <span>{paymentRef.current.paid_at}</span>
                </div>
              </div>

              <div className="border-t-[1.5px] border-dashed border-gray-300 py-3 my-3">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2 font-semibold">Qty Item</th>
                      <th className="pb-2 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={i}>
                        <td className="py-1 align-top">{l.qty}x {l.name}</td>
                        <td className="py-1 text-right align-top">₹{(l.price * l.qty).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t-[1.5px] border-dashed border-gray-300 py-3 my-3 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{paymentRef.current.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{paymentRef.current.tax_amount.toLocaleString("en-IN")}</span>
                </div>
                {(paymentRef.current.tip_amount ?? 0) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tip</span>
                    <span>₹{paymentRef.current.tip_amount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-200">
                  <span>GRAND TOTAL</span>
                  <span>₹{paymentRef.current.grand_total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="border-t-[1.5px] border-dashed border-gray-300 py-3 mt-3 text-center">
                <span className="inline-block border border-gray-900 rounded px-2 py-1 text-xs font-bold uppercase tracking-wider mb-2">
                  Paid via {paymentRef.current.method}
                </span>
                <p className="font-semibold mt-2">Thank you for dining with us!</p>
                <p className="text-xs text-gray-500 mt-1">test@upi</p>
              </div>
            </div>

            {/* Confetti burst */}
            <Confetti />

            <RewardOffer totalPaid={paymentRef.current.grand_total} />

            <div className="mt-5 flex gap-3">
              <Button variant="ghost" className="flex-1 justify-center" onClick={handlePrint}>
                <ReceiptIcon size={15} /> Print Receipt
              </Button>
              <Button variant="primary" className="flex-1 justify-center" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : stage !== "done" ? (
          <div className="px-5 py-5">
            {/* Line items */}
            <div className="max-h-40 overflow-y-auto mb-3 pr-2 scrollbar-thin scrollbar-thumb-obsidian-700">
              <ul className="space-y-2">
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
            </div>

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
            <div className="mt-6">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                Pay via
              </span>
              <div className="grid grid-cols-3 gap-2">
                <MethodBtn active={method === "upi"} onClick={() => setMethod("upi")} icon={<Smartphone size={15} />} label="UPI QR" />
                <MethodBtn active={method === "card"} onClick={() => setMethod("card")} icon={<CreditCard size={15} />} label="Card" />
                <MethodBtn active={method === "cash"} onClick={() => setMethod("cash")} icon={<Banknote size={15} />} label="Cash" />
              </div>
            </div>

            {/* Method Specific UI */}
            <div className="mt-4 min-h-[160px]">
              <AnimatePresence mode="wait">
                {method === "upi" && (
                  <motion.div
                    key="upi"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center p-4 border border-line-soft rounded-lg bg-obsidian-850"
                  >
                    <div className="bg-white p-2 rounded-lg mb-3">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=test@upi%26pn=Saffron%20%26%20Smoke%26am=${grandTotal}%26cu=INR%26tn=Table${table.table_number}`}
                        alt="UPI QR Code" 
                        className="w-32 h-32"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-ink text-sm">₹{grandTotal.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-ink-muted">UPI ID: test@upi</p>
                      <p className="text-xs text-ink-subtle mt-1 flex items-center justify-center gap-1">
                        <QrCode size={12} /> Scan with Google Pay, PhonePe, or any UPI app
                      </p>
                    </div>
                  </motion.div>
                )}

                {method === "card" && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 border border-line-soft rounded-lg bg-obsidian-850"
                  >
                    <div className="space-y-3">
                      <div className="relative">
                        <label className="text-xs text-ink-subtle block mb-1">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            placeholder="0000 0000 0000 0000"
                            className="w-full rounded-md border border-line-soft bg-obsidian-800 pl-9 pr-10 py-2 text-sm focus:border-ink focus:outline-none font-mono"
                          />
                          <CreditCard className="absolute left-3 top-2.5 text-ink-subtle" size={16} />
                          {cardNumber.length > 0 && (
                            <div className="absolute right-3 top-2.5">
                              {isLuhnValid ? (
                                <CheckCircle2 className="text-state-ok" size={16} />
                              ) : (
                                <X className="text-state-error" size={16} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-ink-subtle block mb-1">Expiry</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            maxLength={5}
                            placeholder="MM/YY"
                            className="w-full rounded-md border border-line-soft bg-obsidian-800 px-3 py-2 text-sm focus:border-ink focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-ink-subtle block mb-1">CVV</label>
                          <input
                            type="text"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            maxLength={4}
                            placeholder="123"
                            className="w-full rounded-md border border-line-soft bg-obsidian-800 px-3 py-2 text-sm focus:border-ink focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-ink-subtle bg-obsidian-900 p-2 rounded border border-line-soft flex gap-2">
                      <AlertCircle size={14} className="shrink-0 text-ink-muted" />
                      <div>
                        <p>⚠️ Uses Luhn algorithm — enter a valid (but not necessarily real) debit/credit card number. Random numbers won't work.</p>
                        <p className="mt-1 font-mono text-ink-muted">e.g. 4111 1111 1111 1111 (Visa test)</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {method === "cash" && (
                  <motion.div
                    key="cash"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center p-6 border border-line-soft rounded-lg bg-obsidian-850 h-full text-center"
                  >
                    <Banknote size={32} className="text-ink-muted mb-3" />
                    <p className="font-semibold text-ink text-sm">Pay by Cash</p>
                    <p className="text-xs text-ink-subtle mt-1">Please hand the cash to your server.</p>
                    <p className="text-xs text-ink-subtle mt-1">Amount due: <strong className="text-ink">₹{grandTotal.toLocaleString("en-IN")}</strong></p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pay / processing */}
            <Button
              variant="primary"
              className="mt-5 w-full justify-center"
              disabled={isPayDisabled}
              onClick={handlePay}
            >
              {stage === "processing" ? (
                <ProcessingBar />
              ) : (
                `Pay ₹${grandTotal.toLocaleString("en-IN")}`
              )}
            </Button>
            <p className="mt-2 text-center text-xs text-ink-subtle">
              Simulated payment for the demo — no actual charge.
            </p>
          </div>
        ) : null}
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
