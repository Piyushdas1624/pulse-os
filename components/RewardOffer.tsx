"use client";

import { motion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";

/** Post-payment loyalty reveal. Reciprocity + endowment effect: a guest who
 *  has just "earned" points feels invested in returning. Beautiful, not
 *  pushy. */
export function RewardOffer({ totalPaid }: { totalPaid: number }) {
  // 1 PulsePoint per ₹10 spent — round, friendly number.
  const points = Math.max(25, Math.round(totalPaid / 10));
  // A redeemable offer tiered to the bill.
  const offer =
    totalPaid >= 3000
      ? { code: "PULSE500", label: "₹500 off", note: "your next visit" }
      : totalPaid >= 1500
      ? { code: "PULSE200", label: "₹200 off", note: "your next visit" }
      : { code: "PULSE100", label: "₹100 off", note: "your next visit" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="mt-5 overflow-hidden rounded-lg border border-state-thinkDim bg-state-thinkDim/30"
    >
      <div className="flex items-center gap-3 border-b border-state-thinkDim/60 px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-state-thinkDim text-state-think">
          <Gift size={18} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">
            You earned <span className="text-state-think">{points} PulsePoints</span>
          </p>
          <p className="text-xs text-ink-subtle">Banked to your table — redeem on your next visit.</p>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-state-think" />
          <span className="text-sm text-ink-muted">
            Unlock <span className="font-semibold text-ink">{offer.label}</span> {offer.note}
          </span>
        </div>
        <span className="rounded-md border border-dashed border-state-think/60 bg-obsidian-900 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-state-think">
          {offer.code}
        </span>
      </div>
    </motion.div>
  );
}
