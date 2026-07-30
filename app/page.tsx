"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import OperationalKPIs from "@/components/OperationalKPIs";
import LiveEventTimeline from "@/components/LiveEventTimeline";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { Button, Panel, PanelHead, cx } from "@/components/ui/primitives";
import { toast } from "@/components/ui/Toast";

/**
 * Overview = executive briefing.
 * It answers one question in the first screenful: what needs me right now.
 * The old marketing copy ("Three steps, not three dashboards") is gone.
 */
export default function Home() {
  const router = useRouter();
  const { tables, inventory, kitchenQueue, getComputedRiskLevel, getComputedBottleneck } =
    usePulseStore();

  const critical = [...inventory]
    .filter((i) => i.current_stock <= i.min_threshold)
    .sort((a, b) => a.est_runout_mins - b.est_runout_mins)[0];

  const seated = tables.filter((t) => t.status !== "available").length;
  const openBill = tables.reduce((s, t) => s + t.bill_amount, 0);
  const cooking = kitchenQueue.filter((k) => k.status === "cooking").length;
  const risk = getComputedRiskLevel();

  return (
    <ProtectedRoute allowedRoles={["owner", "manager", "kitchen_staff"]}>
    <>
      <Navbar />
      <main className="mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12">
        <div className="mb-12 max-w-[64ch]">
          <div className="eyebrow mb-3">Executive briefing</div>
          <h1 className="mb-3 text-[clamp(2.25rem,4vw,3rem)]">
            {critical ? (
              <>
                Service is holding.{" "}
                <em className="not-italic text-ink-subtle">One thing needs you.</em>
              </>
            ) : (
              <>
                Service is clean.{" "}
                <em className="not-italic text-ink-subtle">Nothing needs you.</em>
              </>
            )}
          </h1>
          <p className="max-w-[58ch] text-[1.0625rem] text-ink-muted">
            {seated} of {tables.length} tables seated, ₹{openBill.toLocaleString("en-IN")} open on
            the floor, {cooking} ticket{cooking === 1 ? "" : "s"} cooking. Risk level reads{" "}
            {risk.toLowerCase()}, with {getComputedBottleneck()} carrying the most load.
          </p>
        </div>

        {/* The single most important thing on the page. Full border, tinted
            background, one primary action. Not a side-striped alert box. */}
        <div
          className={cx(
            "mb-12 grid grid-cols-[auto_1fr] items-center gap-5 rounded-lg border p-5 md:grid-cols-[auto_1fr_auto]",
            critical
              ? "border-state-riskDim bg-state-riskDim/35"
              : "border-state-okDim bg-state-okDim/30"
          )}
        >
          <span
            className={cx(
              "grid h-[42px] w-[42px] place-items-center rounded-xl",
              critical ? "bg-state-riskDim text-state-risk" : "bg-state-okDim text-state-ok"
            )}
          >
            {critical ? <AlertTriangle size={20} /> : <Check size={20} />}
          </span>

          <div>
            <h2 className="mb-0.5 text-[1.0625rem]">
              {critical
                ? `${critical.name} runs out in ${critical.est_runout_mins} minutes`
                : "Nothing at risk"}
            </h2>
            <p className="text-sm text-ink-muted">
              {critical
                ? `${critical.current_stock}${critical.unit} left against a ${critical.min_threshold}${critical.unit} floor. ₹${critical.potential_loss.toLocaleString("en-IN")} of tonight's bookings are exposed.`
                : "Stock, kitchen load and table turns are all inside normal range for this hour."}
            </p>
          </div>

          <div className="col-span-2 flex items-center gap-2 md:col-span-1">
            {critical ? (
              <>
                <Button variant="primary" onClick={() => router.push("/ai-ops")}>
                  Review &amp; resolve <ArrowRight size={15} />
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => toast("Snoozed for an hour. It resurfaces if stock drops further.")}
                >
                  Snooze 1h
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => router.push("/operations")}>
                Open floor
              </Button>
            )}
          </div>
        </div>

        <OperationalKPIs />

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <LiveEventTimeline />

          <Panel>
            <PanelHead
              title="Where to go next"
              action={
                <Link href="/operations" className="text-xs font-semibold text-ink-subtle hover:text-ink">
                  Open floor
                </Link>
              }
            />
            <div className="divide-y divide-line-soft">
              <NextStep
                href="/operations"
                title="Floor and kitchen"
                body={`${seated} tables live, ${cooking} tickets cooking. Batch what you can before the next seating.`}
              />
              <NextStep
                href="/ai-ops"
                title="AI advisor"
                body="Grounded recommendations with the reasoning and the rejected alternatives, both shown."
              />
              <NextStep
                href="/customer"
                title="Guest ordering"
                body="What the table sees. Orders here update the twin in under a second."
              />
            </div>
          </Panel>
        </div>
      </main>
    </>
    </ProtectedRoute>
  );
}

function NextStep({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 px-5 py-4 transition-colors duration-150 ease-out-quart hover:bg-obsidian-800"
    >
      <div className="min-w-0">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="mt-0.5 text-sm text-ink-subtle">{body}</p>
      </div>
      <ArrowRight
        size={16}
        className="ml-auto mt-1 shrink-0 text-ink-subtle transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5 group-hover:text-ink"
      />
    </Link>
  );
}
