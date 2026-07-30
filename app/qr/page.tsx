"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Printer, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel, PanelHead, Button, Tag, cx } from "@/components/ui/primitives";

/**
 * QR hub. Each table gets a printed card encoding {origin}/customer?table=N,
 * so a guest scans, lands on the menu pre-bound to that table, orders, and
 * the operations floor twin updates in real time. Concrete proof the system
 * works in a real restaurant — and judges can scan it themselves during the
 * demo (endowment effect).
 */

const ZONES = ["Window", "Window", "Patio", "Main", "Main", "Main", "Bar", "Private"];

export default function QrPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "manager"]}>
      <Navbar />
      <main className="mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Live ordering</div>
            <h1 className="text-[2.125rem]">QR codes</h1>
            <p className="mt-2 max-w-[58ch] text-sm text-ink-subtle">
              Print a card per table. Scanning it opens the guest menu already bound to that table —
              no app, no login. Orders land on the floor twin in under a second.
            </p>
          </div>
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer size={15} /> Print all cards
          </Button>
        </div>

        <QrGrid />

        <p className="mt-8 max-w-[60ch] text-sm text-ink-subtle">
          Tip for the demo: open the operations floor on a second screen, then scan a code with your
          phone and place an order — the table lights up live.
        </p>
      </main>
    </ProtectedRoute>
  );
}

function QrGrid() {
  const tables = usePulseStore((s) => s.tables);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://pulseos.app";

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-2">
      {tables.map((t, i) => (
        <Panel key={t.id} className="flex flex-col items-center gap-3 p-5">
          <PanelHead
            title={`Table ${t.table_number}`}
            sub={`${t.capacity} seats`}
            action={<Tag tone="calm">{ZONES[i % ZONES.length]}</Tag>}
          />
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4">
            <div className="rounded-lg bg-white p-3">
              <QRCodeCanvas
                id={`qr-${t.id}`}
                value={`${origin}/customer?table=${t.table_number}`}
                size={150}
                level="M"
                marginSize={0}
              />
            </div>
            <p className="text-center text-xs text-ink-subtle">
              {origin.replace(/^https?:\/\//, "")}/customer?table={t.table_number}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center print:hidden"
            onClick={() => downloadPng(t.id, t.table_number)}
          >
            <Download size={14} /> Download
          </Button>
        </Panel>
      ))}
    </div>
  );
}

/** Export a single table's QR canvas as a PNG. */
function downloadPng(tableId: string, tableNumber: number) {
  const canvas = document.getElementById(`qr-${tableId}`) as HTMLCanvasElement | null;
  if (!canvas) return;
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `pulseos-table-${tableNumber}.png`;
  a.click();
}
