"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

type Toast = { id: number; msg: string; action?: { label: string; href: string } };

let push: ((t: Omit<Toast, "id">) => void) | null = null;

/** Fire from anywhere: toast("Table 5 updated", { label: "View floor", href: "/operations" }) */
export function toast(msg: string, action?: Toast["action"]) {
  push?.({ msg, action });
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    push = (t) => {
      const id = Date.now() + Math.random();
      setItems((v) => [...v, { ...t, id }]);
      setTimeout(() => setItems((v) => v.filter((x) => x.id !== id)), t.action ? 6000 : 3800);
    };
    return () => {
      push = null;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2.5">
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex animate-fade-in items-center gap-3 rounded-lg border border-line bg-obsidian-700 py-2.5 pl-3 pr-4 text-sm shadow-raise"
        >
          <Check size={16} className="shrink-0 text-state-ok" />
          <span>{t.msg}</span>
          {t.action && (
            <a
              href={t.action.href}
              className="ml-1.5 text-xs font-semibold text-ink-subtle hover:text-ink"
            >
              {t.action.label}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
