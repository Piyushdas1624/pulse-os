"use client";

import { usePulseStore } from "@/lib/store/usePulseStore";
import type { Table, TableStatus } from "@/lib/types/pulse";
import { Panel, Tag, Button, type Tone } from "@/components/ui/primitives";
import { toast } from "@/components/ui/Toast";

/**
 * A real floor, not a grid of equal boxes.
 * Geometry encodes capacity: circle = 2, square = 4, rounded booth = 6+.
 * Colour encodes state and nothing else.
 */

const STATUS: Record<
  TableStatus,
  { label: string; stroke: string; fill: string; tone: Tone }
> = {
  available:       { label: "Available",      stroke: "var(--ok)",    fill: "var(--ok-dim)",    tone: "ok" },
  occupied:        { label: "Seated",         stroke: "var(--mut)",   fill: "var(--sur)",       tone: "mute" },
  ordering:        { label: "Ordering",       stroke: "var(--think)", fill: "var(--think-dim)", tone: "think" },
  kitchen_cooking: { label: "In kitchen",     stroke: "var(--busy)",  fill: "var(--busy-dim)",  tone: "busy" },
  served:          { label: "Served",         stroke: "var(--calm)",  fill: "var(--calm-dim)",  tone: "calm" },
  needs_cleaning:  { label: "Needs clearing", stroke: "var(--risk)",  fill: "var(--risk-dim)",  tone: "risk" },
};

const LEGEND = [
  { label: "Available", color: "oklch(76% 0.125 156)" },
  { label: "Seated", color: "oklch(75% 0.011 72)" },
  { label: "In kitchen", color: "oklch(80% 0.130 74)" },
  { label: "Served", color: "oklch(76% 0.095 232)" },
  { label: "Needs clearing", color: "oklch(69% 0.165 26)" },
];

/** x_pos / y_pos in the store are percentages. Map them onto the room. */
const px = (p: number) => 90 + (p / 100) * 700;
const py = (p: number) => 130 + (p / 100) * 300;

function seats(cap: number) {
  if (cap <= 2) return [[0, -50], [0, 50]];
  if (cap <= 4) return [[-54, 0], [54, 0], [0, -54], [0, 54]];
  const out: number[][] = [];
  const perSide = Math.ceil((cap - 2) / 2);
  const span = (perSide - 1) * 46;
  for (let i = 0; i < perSide; i++) {
    out.push([-span / 2 + i * 46, -46], [-span / 2 + i * 46, 46]);
  }
  out.push([-span / 2 - 44, 0], [span / 2 + 44, 0]);
  return out;
}

function Shape({ table }: { table: Table }) {
  const s = STATUS[table.status];
  const common = { fill: s.fill, stroke: s.stroke, strokeWidth: 2 };
  if (table.capacity <= 2) return <circle r={34} {...common} />;
  if (table.capacity <= 4) return <rect x={-38} y={-38} width={76} height={76} rx={10} {...common} />;
  const w = 40 + table.capacity * 14;
  return <rect x={-w / 2} y={-30} width={w} height={60} rx={30} {...common} />;
}

export default function FloorPlanSvg() {
  const { tables, selectedTableId, setSelectedTableId, clearTable } = usePulseStore();
  const selected = tables.find((t) => t.id === selectedTableId);

  return (
    <Panel className="p-4">
      <svg
        viewBox="0 0 900 520"
        role="img"
        aria-label="Restaurant floor plan"
        className="block h-auto w-full"
        style={
          {
            "--ok": "oklch(76% 0.125 156)",
            "--ok-dim": "oklch(30% 0.055 156)",
            "--busy": "oklch(80% 0.130 74)",
            "--busy-dim": "oklch(31% 0.058 74)",
            "--risk": "oklch(69% 0.165 26)",
            "--risk-dim": "oklch(30% 0.075 26)",
            "--calm": "oklch(76% 0.095 232)",
            "--calm-dim": "oklch(30% 0.048 232)",
            "--think": "oklch(74% 0.110 302)",
            "--think-dim": "oklch(29% 0.055 302)",
            "--mut": "oklch(75% 0.011 72)",
            "--sur": "oklch(26.5% 0.010 68)",
            "--ln": "oklch(38% 0.013 68)",
            "--ln-soft": "oklch(23.5% 0.009 68)",
          } as React.CSSProperties
        }
      >
        <defs>
          <pattern id="floorgrid" width={30} height={30} patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" fill="none" stroke="var(--ln-soft)" strokeWidth={1} />
          </pattern>
        </defs>

        <rect width={900} height={520} rx={10} fill="url(#floorgrid)" />
        <path d="M28 28 H872 V492 H28 Z" fill="none" stroke="var(--ln)" strokeWidth={2} />

        {/* kitchen pass: the green line is the pass window, an actual landmark */}
        <g>
          <rect x={28} y={28} width={300} height={62} fill="oklch(22.5% 0.009 68)" stroke="var(--ln)" strokeWidth={1.5} />
          <text x={48} y={65} fill="oklch(75% 0.011 72)" fontSize={15} fontWeight={600}>Kitchen pass</text>
          <line x1={328} y1={34} x2={328} y2={84} stroke="var(--ok)" strokeWidth={3} />
        </g>

        {/* bar with stools */}
        <g>
          <rect x={748} y={28} width={124} height={212} fill="oklch(22.5% 0.009 68)" stroke="var(--ln)" strokeWidth={1.5} />
          <text x={810} y={140} fill="oklch(75% 0.011 72)" fontSize={15} fontWeight={600} textAnchor="middle">Bar</text>
          {[60, 98, 136, 174, 212].map((cy) => (
            <circle key={cy} cx={736} cy={cy} r={7} fill="var(--ln)" />
          ))}
        </g>

        {/* restrooms, back of house */}
        <g>
          <rect x={748} y={404} width={124} height={88} fill="oklch(19% 0.008 68)" stroke="oklch(28% 0.010 68)" strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={810} y={454} fill="oklch(58% 0.012 72)" fontSize={13} textAnchor="middle">Restrooms</text>
        </g>

        {/* entrance with door swing */}
        <g>
          <rect x={28} y={424} width={170} height={68} fill="oklch(19% 0.008 68)" stroke="oklch(28% 0.010 68)" strokeWidth={1.5} />
          <text x={52} y={464} fill="oklch(58% 0.012 72)" fontSize={13}>Entrance / host</text>
          <path d="M28 424 A68 68 0 0 1 96 492" fill="none" stroke="var(--ln)" strokeWidth={1.5} strokeDasharray="3 4" />
        </g>

        {tables.map((t) => {
          const s = STATUS[t.status];
          const isSel = t.id === selectedTableId;
          return (
            <g
              key={t.id}
              role="button"
              tabIndex={0}
              aria-label={`Table ${t.table_number}, ${t.capacity} seats, ${s.label}`}
              transform={`translate(${px(t.x_pos)},${py(t.y_pos)})`}
              onClick={() => setSelectedTableId(t.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedTableId(t.id);
                }
              }}
              className="origin-center cursor-pointer transition-transform duration-200 ease-out-expo hover:scale-[1.045] [transform-box:fill-box]"
            >
              {seats(t.capacity).map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={7} fill="oklch(30% 0.011 68)" opacity={0.5} />
              ))}
              {isSel && (
                <circle r={t.capacity <= 2 ? 46 : 62} fill="none" stroke={s.stroke} strokeWidth={2} opacity={0.7} />
              )}
              <Shape table={t} />
              <text y={-3} textAnchor="middle" fontSize={17} fontWeight={600} fill="oklch(96% 0.005 78)">
                T{t.table_number}
              </text>
              <text y={16} textAnchor="middle" fontSize={11} fill={s.stroke} letterSpacing="0.04em">
                {s.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line-soft px-2 pt-4">
        {LEGEND.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-2 text-xs text-ink-muted">
            <i className="block h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
        <span className="ml-auto text-xs text-ink-subtle">
          Round = 2 &middot; Square = 4 &middot; Booth = 6+
        </span>
      </div>

      {selected && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded border border-line-soft bg-obsidian-800 px-4 py-3">
          <div>
            <div className="eyebrow mb-1">
              Table {selected.table_number} · {selected.capacity} seats
            </div>
            <Tag tone={STATUS[selected.status].tone}>{STATUS[selected.status].label}</Tag>
          </div>
          <div className="text-sm text-ink-muted">
            Open bill{" "}
            <b className="num font-semibold text-ink">
              ₹{selected.bill_amount.toLocaleString("en-IN")}
            </b>
            {selected.seated_at && <> · seated {selected.seated_at}</>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => {
              clearTable(selected.id);
              toast(`Table ${selected.table_number} cleared and back in service.`);
            }}
          >
            Clear table
          </Button>
        </div>
      )}
    </Panel>
  );
}
