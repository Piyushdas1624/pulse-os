"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel } from "@/components/ui/primitives";
import { isLiveProvider, activeModelLabel } from "@/lib/ai/providerState";

/**
 * Two bugs fixed here:
 *  1. NaN%  — budget_used / today_budget divided by zero on first load.
 *             Now: if there is no budget, we render an "unset" state instead
 *             of doing arithmetic on 0. No fake denominator, no fake number.
 *  2. Stale "Gemini 1.5 Flash" label — now bound to governor.selected_model.
 */
export default function AICostSavingsCard() {
  const governor = usePulseStore((s) => s.governor);
  const live = isLiveProvider(governor);

  const cap = governor.today_budget_inr;
  const used = governor.budget_used_inr;
  const hasBudget = cap > 0;
  const pct = hasBudget ? Math.min(100, (used / cap) * 100) : 0;

  const cacheRate =
    governor.ai_requests_count > 0
      ? Math.round((governor.cache_hit_count / governor.ai_requests_count) * 100)
      : null;

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-line-soft bg-obsidian-850 md:grid-cols-5">
        <Cell label="Model" value={activeModelLabel(governor)} small />
        <Cell label="Requests today" value={governor.ai_requests_count} />
        <Cell
          label="Cache hit rate"
          value={cacheRate === null ? "—" : `${cacheRate}%`}
        />
        <Cell
          label="Median latency"
          value={governor.avg_latency_ms > 0 ? `${governor.avg_latency_ms}ms` : "—"}
        />
        <Cell
          label="Tokens saved"
          value={governor.tokens_saved_pct > 0 ? `${governor.tokens_saved_pct}%` : "—"}
        />
      </dl>

      <Panel className="p-5">
        <div className="mb-4 flex items-baseline gap-3">
          <h3 className="text-base font-semibold">Daily spend</h3>
          <span className="ml-auto text-sm text-ink-muted">
            {hasBudget ? (
              <>
                <span className="num">₹{used}</span> of{" "}
                <span className="num">₹{cap}</span> · {Math.round(100 - pct)}% left
              </>
            ) : (
              "No budget set"
            )}
          </span>
        </div>

        {hasBudget ? (
          <div className="h-[7px] overflow-hidden rounded-sm bg-obsidian-700">
            <span
              className="block h-full bg-state-calm transition-[width] duration-700 ease-out-expo"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : (
          <div className="h-[9px] rounded-sm border border-dashed border-line-loud" />
        )}

        <small className="mt-2.5 block text-xs text-ink-subtle">
          {hasBudget
            ? "Cap is enforced server side. At 90% the governor drops to cached and deterministic answers instead of failing."
            : live
            ? "Set a daily cap in Settings and this fills instead."
            : "Demo mode costs nothing. Connect a key in Settings to start tracking spend."}
        </small>
      </Panel>
    </div>
  );
}

function Cell({
  label,
  value,
  small,
}: {
  label: string;
  value: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="border-b border-r border-line-soft px-5 py-4 last:border-r-0">
      <dt className="mb-1 text-xs text-ink-subtle">{label}</dt>
      <dd
        className={
          small
            ? "text-base font-medium"
            : "num text-[1.375rem] font-semibold leading-tight tracking-[-0.02em]"
        }
      >
        {value}
      </dd>
    </div>
  );
}
