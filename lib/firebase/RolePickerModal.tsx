"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, UserRole } from "@/lib/firebase/AuthContext";
import { cx } from "@/components/ui/primitives";

/* A role card shown when a logged-in user has not yet picked an access role
   (Google / phone / legacy signups). Rendered globally from the root layout
   so it intercepts the flow regardless of which page the user lands on. */

interface RoleDef {
  role: UserRole;
  title: string;
  blurb: string;
  hint: string;
  tone: string;
}

const ROLES: RoleDef[] = [
  {
    role: "owner",
    title: "Owner",
    blurb: "Full control — every page, every setting.",
    hint: "For the demo host / pitch giver",
    tone: "text-state-ok",
  },
  {
    role: "manager",
    title: "Manager",
    blurb: "Run the floor: operations, staff, orders, AI.",
    hint: "Recommended for judges",
    tone: "text-state-calm",
  },
  {
    role: "kitchen_staff",
    title: "Kitchen Staff",
    blurb: "See operations + active orders only.",
    hint: "Line-cook view",
    tone: "text-state-busy",
  },
  {
    role: "customer",
    title: "Customer",
    blurb: "Guest ordering via the live QR menu.",
    hint: "Public guest flow",
    tone: "text-state-think",
  },
];

export function RolePickerModal() {
  const { needsRoleSelection, setRoleAndContinue, user } = useAuth();
  const [busy, setBusy] = useState<UserRole | null>(null);

  if (!needsRoleSelection) return null;

  const greeting =
    user?.displayName || user?.email
      ? `Welcome${user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}`
      : "Welcome to PulseOS";

  const choose = async (role: UserRole) => {
    setBusy(role);
    try {
      await setRoleAndContinue(role);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* backdrop */}
        <div className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-sm" />

        {/* dialog */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Choose your role"
          className="relative w-full max-w-2xl rounded-lg border border-line bg-obsidian-900 shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="border-b border-line-soft px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              One last step
            </p>
            <h2 className="mt-1 text-xl font-semibold">{greeting}</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Pick a role to tailor your dashboard. You can keep{" "}
              <span className="font-medium text-ink">Manager</span> for the full tour.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            {ROLES.map((r) => {
              const isBusy = busy === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => choose(r.role)}
                  disabled={busy !== null}
                  className={cx(
                    "group flex flex-col gap-1.5 rounded-lg border border-line-soft bg-obsidian-850 p-4 text-left",
                    "transition-[border-color,transform,background-color] duration-150 ease-out-quart",
                    "hover:border-line hover:bg-obsidian-800 hover:-translate-y-0.5",
                    "disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span className={cx("text-sm font-semibold uppercase tracking-[0.04em]", r.tone)}>
                      {r.title}
                    </span>
                    {isBusy && (
                      <span className="text-xs text-ink-subtle">Selecting…</span>
                    )}
                  </span>
                  <span className="text-sm text-ink-muted">{r.blurb}</span>
                  <span className="text-xs text-ink-subtle">{r.hint}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-line-soft px-6 py-3">
            <p className="text-xs text-ink-subtle">
              This choice is saved to your profile and remembered next time.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
