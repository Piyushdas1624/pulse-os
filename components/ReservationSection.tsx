"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  User,
  CheckCircle,
  X,
} from "lucide-react";
import { Panel, Button, cx } from "@/components/ui/primitives";

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM
  tableNumber: number;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string; // ISO
}

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
];

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime12(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function ReservationSection() {
  const today = new Date().toISOString().split("T")[0];

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("19:00");
  const [submitted, setSubmitted] = useState<Reservation | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date || !time) return;

    // Assign a table deterministically based on date+time hash
    const hash = (name.length + partySize + time.charCodeAt(0)) % 8 + 1;
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      partySize,
      date,
      time,
      tableNumber: hash,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [newRes, ...prev]);
    setSubmitted(newRes);
    setShowForm(false);
    setName("");
    setPhone("");
    setPartySize(2);
    setDate(today);
    setTime("19:00");
  };

  return (
    <div className="mt-6">
      <Panel className="overflow-hidden">
        <div className="px-5 py-4 border-b border-line-soft flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-ink-subtle" />
            <h2 className="text-sm font-semibold">Table Reservations</h2>
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowForm((v) => !v)}
            className="text-xs"
          >
            {showForm ? <><X size={13} /> Cancel</> : <><Calendar size={13} /> Reserve a table</>}
          </Button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="overflow-hidden border-b border-line-soft bg-obsidian-850"
            >
              <div className="p-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-ink-subtle">
                    <User size={11} className="inline mr-1" />Your name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Arjun Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-line-soft bg-obsidian-800 px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-ink-subtle">
                    <Phone size={11} className="inline mr-1" />Phone number
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-line-soft bg-obsidian-800 px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-ink-subtle">
                    <Calendar size={11} className="inline mr-1" />Date
                  </label>
                  <input
                    required
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-md border border-line-soft bg-obsidian-800 px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-ink-subtle">
                    <Clock size={11} className="inline mr-1" />Time slot
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-md border border-line-soft bg-obsidian-800 px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {formatTime12(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-ink-subtle">
                    <Users size={11} className="inline mr-1" />Party size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPartySize(n)}
                        className={cx(
                          "rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors",
                          partySize === n
                            ? "border-ink bg-ink text-obsidian-900"
                            : "border-line-soft bg-obsidian-800 text-ink-muted hover:border-line"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button variant="primary" type="submit">
                    <Calendar size={14} /> Confirm reservation
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Success confirmation */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-5 my-4 flex items-start gap-3 rounded-lg border border-state-okDim bg-state-okDim/20 px-4 py-3"
            >
              <CheckCircle size={18} className="mt-0.5 shrink-0 text-state-ok" />
              <div>
                <p className="text-sm font-semibold text-state-ok">Reservation confirmed!</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  <strong>{submitted.name}</strong> · {submitted.partySize} guests ·{" "}
                  {formatDate(submitted.date)} at {formatTime12(submitted.time)}
                </p>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  Table {submitted.tableNumber} · Our team will call you at {submitted.phone} to confirm.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(null)}
                className="ml-auto text-ink-subtle hover:text-ink"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming reservations */}
        {reservations.length > 0 ? (
          <div className="divide-y divide-line-soft">
            {reservations.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-obsidian-800 text-sm font-semibold text-ink">
                  {r.tableNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{r.name}</p>
                  <p className="text-xs text-ink-subtle">
                    {formatDate(r.date)} · {formatTime12(r.time)} · {r.partySize} guests
                  </p>
                </div>
                <span className={cx(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  r.status === "confirmed" ? "bg-state-okDim text-state-ok" : "bg-obsidian-800 text-ink-subtle"
                )}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-6 text-center text-sm text-ink-subtle">
            No upcoming reservations. Click &quot;Reserve a table&quot; to get started.
          </div>
        )}
      </Panel>
    </div>
  );
}
