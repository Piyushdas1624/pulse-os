"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, User, Mail, Phone, Clock, Star, Trash2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel, Button, Tag, StatStrip, Stat, cx } from "@/components/ui/primitives";
import { StaffMember } from "@/lib/types/pulse";

export default function StaffPage() {
  const { staff, addStaff, toggleStaffStatus, removeStaff } = usePulseStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalStaff = staff.length;
  const onDuty = staff.filter((s) => s.shift_status === "on_duty").length;
  const offDuty = staff.filter((s) => s.shift_status === "off_duty").length;
  const onBreak = staff.filter((s) => s.shift_status === "break").length;

  return (
    <ProtectedRoute allowedRoles={["owner", "manager"]}>
    <>
      <Navbar />
      <main className="mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end gap-4">
          <div>
            <div className="eyebrow mb-2">Team Operations</div>
            <h1 className="text-[2.125rem]">Staff Management</h1>
          </div>
          <Button variant="primary" className="ml-auto" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </div>

        <Panel className="mb-8 overflow-hidden">
          <StatStrip>
            <Stat label="Total Staff" value={totalStaff} />
            <Stat label="On Duty" value={onDuty} deltaTone="up" />
            <Stat label="On Break" value={onBreak} deltaTone="down" />
            <Stat label="Off Duty" value={offDuty} />
          </StatStrip>
        </Panel>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {staff.map((member) => (
              <StaffCard
                key={member.id}
                member={member}
                onToggleStatus={() => toggleStaffStatus(member.id)}
                onRemove={() => removeStaff(member.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddStaffModal onClose={() => setIsAddModalOpen(false)} onAdd={addStaff} />
        )}
      </AnimatePresence>
    </>
    </ProtectedRoute>
  );
}

function StaffCard({
  member,
  onToggleStatus,
  onRemove,
}: {
  member: StaffMember;
  onToggleStatus: () => void;
  onRemove: () => void;
}) {
  const statusColor =
    member.shift_status === "on_duty"
      ? "ok"
      : member.shift_status === "break"
      ? "busy"
      : "mute";

  const statusLabel =
    member.shift_status === "on_duty"
      ? "On Duty"
      : member.shift_status === "break"
      ? "Break"
      : "Off Duty";

  const initials = member.full_name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Panel className="h-full flex flex-col overflow-hidden p-0">
        {/* Avatar header */}
        <div className="relative flex items-center gap-4 border-b border-line-soft bg-obsidian-850 px-5 py-4">
          <div className="relative h-14 w-14 shrink-0">
            {member.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className="h-14 w-14 rounded-full border-2 border-line-soft bg-obsidian-800 object-cover"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-line-soft bg-obsidian-800 text-lg font-semibold text-ink">
                {initials}
              </div>
            )}
            {/* Status dot */}
            <span className={cx(
              "absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-obsidian-850",
              member.shift_status === "on_duty" ? "bg-state-ok" :
              member.shift_status === "break" ? "bg-state-busy" : "bg-ink-subtle"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-ink truncate">{member.full_name}</p>
              <Button variant="quiet" size="sm" onClick={onRemove} title="Remove Staff">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-ink-subtle mt-0.5">{member.role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</p>
            <Tag tone={statusColor}>{statusLabel}</Tag>
          </div>
        </div>

        <div className="flex-1 p-5 text-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-ink-muted">
              <Star className="h-3.5 w-3.5 fill-state-busy text-state-busy" />
              <span className="font-semibold text-ink">{member.performance_rating.toFixed(1)}</span>
              <span className="text-xs text-ink-subtle">/ 5.0</span>
            </div>
            <span className="font-semibold text-ink">₹{member.hourly_rate}/hr</span>
          </div>
          <div className="text-ink-muted space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-ink-subtle shrink-0" />
              <span className="truncate text-xs">{member.email}</span>
            </div>
            {member.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-ink-subtle" />
                <span className="text-xs">{member.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-ink-subtle" />
              <span className="text-xs">
                {member.shift_start ? `${member.shift_start}${member.shift_end ? ` – ${member.shift_end}` : " – Close"}` : "Unscheduled"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-line-soft bg-obsidian-800 px-4 py-3">
          <Button variant="ghost" className="w-full justify-center" onClick={onToggleStatus}>
            Toggle Status
          </Button>
        </div>
      </Panel>
    </motion.div>
  );
}

function AddStaffModal({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Omit<StaffMember, "id">) => void }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "floor_waiter" as StaffMember["role"],
    hourly_rate: 150,
    shift_status: "off_duty" as StaffMember["shift_status"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      performance_rating: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="w-full max-w-md rounded-lg border border-line-soft bg-obsidian-850 shadow-raise"
      >
        <div className="flex items-center justify-between border-b border-line-soft p-5">
          <h2 className="text-lg font-semibold">Add New Staff</h2>
          <Button variant="quiet" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                Full Name
              </label>
              <input
                required
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full rounded bg-obsidian-900 border border-line-soft px-3 py-2 text-sm focus:border-state-calm focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                Email
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded bg-obsidian-900 border border-line-soft px-3 py-2 text-sm focus:border-state-calm focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded bg-obsidian-900 border border-line-soft px-3 py-2 text-sm focus:border-state-calm focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Hourly Rate (₹)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                  className="w-full rounded bg-obsidian-900 border border-line-soft px-3 py-2 text-sm focus:border-state-calm focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full rounded bg-obsidian-900 border border-line-soft px-3 py-2 text-sm focus:border-state-calm focus:outline-none"
                >
                  <option value="head_chef">Head Chef</option>
                  <option value="sous_chef">Sous Chef</option>
                  <option value="line_cook">Line Cook</option>
                  <option value="floor_waiter">Floor Waiter</option>
                  <option value="floor_captain">Floor Captain</option>
                  <option value="sommelier">Sommelier</option>
                  <option value="host">Host</option>
                  <option value="general_manager">General Manager</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Status
                </label>
                <select
                  value={formData.shift_status}
                  onChange={(e) => setFormData({ ...formData, shift_status: e.target.value as any })}
                  className="w-full rounded bg-obsidian-900 border border-line-soft px-3 py-2 text-sm focus:border-state-calm focus:outline-none"
                >
                  <option value="on_duty">On Duty</option>
                  <option value="off_duty">Off Duty</option>
                  <option value="break">Break</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Staff
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
