"use client";

import { ReactNode } from "react";

export const cx = (...v: (string | false | null | undefined)[]) =>
  v.filter(Boolean).join(" ");

/* ------------------------------------------------------------------
   Panel. Deliberately not called "Card": it is a bordered region, one
   level deep, never nested. If you find yourself putting a Panel inside
   a Panel, use spacing and a divider instead.
   ------------------------------------------------------------------ */
export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-lg border border-line-soft bg-obsidian-850",
        className
      )}
    >
      {children}
    </section>
  );
}

export function PanelHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-baseline gap-3 border-b border-line-soft px-5 py-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {sub && <span className="text-sm text-ink-subtle">{sub}</span>}
      {action && <div className="ml-auto">{action}</div>}
    </header>
  );
}

/* ------------------------------------------------------------------ */
type BtnVariant = "primary" | "ghost" | "quiet";

const BTN: Record<BtnVariant, string> = {
  primary:
    "bg-ink text-obsidian-900 hover:bg-white active:scale-[0.985] font-semibold",
  ghost:
    "border border-line text-ink-muted hover:border-line-loud hover:text-ink hover:bg-obsidian-800",
  quiet: "text-ink-subtle hover:text-ink px-1.5",
};

export function Button({
  children,
  variant = "ghost",
  size = "md",
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center gap-2 rounded font-semibold",
        "transition-[background-color,border-color,transform,opacity] duration-150 ease-out-quart",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm",
        BTN[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
export type Tone = "ok" | "busy" | "risk" | "calm" | "think" | "mute";

const TONE: Record<Tone, string> = {
  ok: "bg-state-okDim text-state-ok",
  busy: "bg-state-busyDim text-state-busy",
  risk: "bg-state-riskDim text-state-risk",
  calm: "bg-state-calmDim text-state-calm",
  think: "bg-state-thinkDim text-state-think",
  mute: "bg-obsidian-700 text-ink-muted",
};

export function Tag({ tone = "mute", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5",
        "text-xs font-semibold uppercase tracking-[0.04em]",
        TONE[tone]
      )}
    >
      {children}
    </span>
  );
}

export function Pill({
  tone,
  children,
}: {
  tone: "live" | "demo" | "neutral";
  children: ReactNode;
}) {
  const map = {
    live: "text-state-ok border-state-okDim bg-state-okDim/55",
    demo: "text-state-busy border-state-busyDim bg-state-busyDim/45",
    neutral: "text-ink-muted border-line bg-obsidian-850",
  }[tone];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border py-1 pl-2.5 pr-3",
        "text-xs font-semibold transition-colors duration-200 ease-out-quart",
        map
      )}
    >
      <span className="block h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------
   Stat row. A divided strip, not four identical boxes. The cliche this
   avoids: big-number-plus-tiny-label cards repeated in a grid.
   ------------------------------------------------------------------ */
export function StatStrip({ children }: { children: ReactNode }) {
  return (
    <dl className="mb-12 grid grid-cols-2 border-y border-line-soft md:grid-cols-4">
      {children}
    </dl>
  );
}

export function Stat({
  label,
  value,
  delta,
  deltaTone,
  children,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "up" | "down";
  children?: ReactNode;
}) {
  return (
    <div className="border-line-soft py-6 pl-6 pr-6 [&:not(:first-child)]:border-l">
      <dt className="mb-1.5 text-sm text-ink-subtle">{label}</dt>
      <dd className="flex items-baseline gap-2.5">
        <span className="num text-[2.125rem] font-semibold leading-none tracking-[-0.03em]">
          {value}
        </span>
        {delta && (
          <span
            className={cx(
              "text-sm font-medium",
              deltaTone === "up"
                ? "text-state-ok"
                : deltaTone === "down"
                ? "text-state-risk"
                : "text-ink-subtle"
            )}
          >
            {delta}
          </span>
        )}
      </dd>
      {children}
    </div>
  );
}

/** Ten segments beats a progress bar: it reads as a gauge, not a loading state. */
export function Gauge({ value, tone = "ok" }: { value: number; tone?: "ok" | "busy" }) {
  const filled = Math.round(Math.max(0, Math.min(100, value)) / 10);
  return (
    <div className="mt-2.5 flex gap-[3px]" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <i
          key={i}
          className={cx(
            "h-[3px] flex-1 rounded-sm",
            i < filled
              ? tone === "ok"
                ? "bg-state-ok"
                : "bg-state-busy"
              : "bg-obsidian-700"
          )}
        />
      ))}
    </div>
  );
}

/** Skeleton, not a spinner. It previews the shape of what is coming. */
export function Skeleton({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-col gap-3 p-5">
      {widths.map((w, i) => (
        <span
          key={i}
          style={{ width: w }}
          className="relative block h-3 overflow-hidden rounded-sm bg-obsidian-800 after:absolute after:inset-0 after:-translate-x-full after:animate-sweep after:bg-gradient-to-r after:from-transparent after:via-obsidian-700 after:to-transparent"
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-2.5 p-8 text-center">
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      <p className="max-w-[30ch] text-sm text-ink-subtle">{hint}</p>
      {action}
    </div>
  );
}
