"use client";

import { motion } from "framer-motion";
import { usePulseStore } from "@/lib/store/usePulseStore";
import {
  Panel,
  PanelHead,
  Button,
  Tag,
  type Tone,
  cx,
} from "@/components/ui/primitives";
import { isLiveProvider, activeModelLabel } from "@/lib/ai/providerState";
import { ArrowRight, HelpCircle, AlertCircle, Loader2 } from "lucide-react";

/**
 * Executive audit card. Same design language as the rest of the app — no
 * glass-panel, no neon, no emojis. Health/risk/opportunity/bottleneck are all
 * computed from the live store; the audit itself goes through the real
 * provider layer. last_error is surfaced inline so a failed scan is never
 * silently idle again (errors.md 6.12).
 */

const RISK_TONE: Record<"LOW" | "MODERATE" | "HIGH", Tone> = {
  LOW: "ok",
  MODERATE: "busy",
  HIGH: "risk",
};

export default function AIHealthScanCard() {
  const {
    governor,
    aiInsights,
    triggerExecutiveAudit,
    isScanningAI,
    applyAIRecommendation,
    setExplainModalInsight,
    getComputedHealthScore,
    getComputedRiskLevel,
    getComputedOpportunity,
    getComputedBottleneck,
  } = usePulseStore();

  const live = isLiveProvider(governor);
  const primary = aiInsights[0];

  const health = getComputedHealthScore();
  const risk = getComputedRiskLevel();
  const opportunity = getComputedOpportunity();
  const bottleneck = getComputedBottleneck();

  return (
    <Panel>
      <PanelHead
        title="Executive audit"
        sub={live ? activeModelLabel(governor) : "deterministic · demo"}
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => triggerExecutiveAudit()}
            disabled={isScanningAI}
          >
            {isScanningAI ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Running…
              </>
            ) : (
              <>Run audit</>
            )}
          </Button>
        }
      />

      <div className="grid grid-cols-2 border-b border-line-soft md:grid-cols-4">
        <Metric label="Health" value={`${health}%`} tone={health >= 80 ? "ok" : "busy"} />
        <Metric label="Risk" value={risk.toLowerCase()} tone={RISK_TONE[risk]} />
        <Metric label="Upside" value={`₹${opportunity.toLocaleString("en-IN")}`} tone="calm" />
        <Metric label="Bottleneck" value={bottleneck} tone={bottleneck === "None" ? "mute" : "busy"} small />
      </div>

      {governor.last_error && (
        <div className="flex items-start gap-2.5 border-b border-state-riskDim bg-state-riskDim/30 px-5 py-3 text-sm text-state-risk">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">Last audit failed. </span>
            <span className="text-state-risk/90">{governor.last_error}</span>
          </div>
        </div>
      )}

      {primary ? (
        // Breathing animation: the only subtly-moving element on the page,
        // so it captures foveal attention (Von Restorff) before the eye reads it.
        <motion.div
          className="px-5 py-5"
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Tag tone={primary.type === "inventory" ? "risk" : "think"}>
                  {primary.type}
                </Tag>
                <span className="num text-xs text-ink-subtle">
                  confidence {primary.confidence}%
                  {primary.snapshot_version === "rule" || primary.snapshot_version === "live"
                    ? ` · ${primary.snapshot_version}`
                    : ` · ${primary.snapshot_version}`}
                </span>
              </div>
              <h3 className="text-base font-semibold">{primary.title}</h3>
            </div>
            <button
              onClick={() => setExplainModalInsight(primary)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded border border-line-soft px-2.5 py-1.5 text-xs font-semibold text-ink-subtle transition-colors hover:border-line-loud hover:text-ink"
            >
              <HelpCircle size={13} /> Why
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Block label="What is happening" tone="risk">
              {primary.problem}
            </Block>
            <Block label="Why" tone="busy">
              {primary.cause}
            </Block>
            <Block label="What to do next" tone="calm" wide>
              {primary.recommendation}
            </Block>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-state-okDim bg-state-okDim/25 px-4 py-3">
            <div className="text-sm">
              <span className="text-xs uppercase tracking-[0.04em] text-state-ok">Projected</span>
              <p className="font-medium">
                Wait{" "}
                <span className="num">
                  −{primary.business_impact.wait_reduction_pct}%
                </span>
                {" · "}revenue{" "}
                <span className="num">
                  +₹{primary.business_impact.revenue_increase_val.toLocaleString("en-IN")}
                </span>
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="ml-auto"
              onClick={() => applyAIRecommendation(primary.id)}
            >
              Apply <ArrowRight size={14} />
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-ink-subtle">
            No insight yet. Run an audit to generate one from the live floor state.
          </p>
        </div>
      )}
    </Panel>
  );
}

function Metric({
  label,
  value,
  tone = "mute",
  small,
}: {
  label: string;
  value: string;
  tone?: Tone;
  small?: boolean;
}) {
  const toneText: Record<Tone, string> = {
    ok: "text-state-ok",
    busy: "text-state-busy",
    risk: "text-state-risk",
    calm: "text-state-calm",
    think: "text-state-think",
    mute: "text-ink",
  };
  return (
    <div className="border-b border-r border-line-soft px-5 py-4 last:border-r-0 [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r-line-soft md:[&:last-child]:border-r-0">
      <div className="mb-1 text-xs text-ink-subtle">{label}</div>
      <div
        className={cx(
          small ? "text-sm font-semibold" : "num text-[1.25rem] font-semibold tracking-[-0.02em]",
          toneText[tone]
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Block({
  label,
  tone,
  wide,
  children,
}: {
  label: string;
  tone: Tone;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const toneText: Record<Tone, string> = {
    ok: "text-state-ok",
    busy: "text-state-busy",
    risk: "text-state-risk",
    calm: "text-state-calm",
    think: "text-state-think",
    mute: "text-ink-muted",
  };
  return (
    <div className={cx("rounded border border-line-soft bg-obsidian-850 p-3", wide && "md:col-span-2")}>
      <div className={cx("mb-1 text-[11px] font-semibold uppercase tracking-[0.04em]", toneText[tone])}>
        {label}
      </div>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}
