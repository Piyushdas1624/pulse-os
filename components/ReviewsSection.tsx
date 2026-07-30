"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Send, X, ThumbsUp } from "lucide-react";
import { Panel, PanelHead, Button, cx } from "@/components/ui/primitives";

export interface Review {
  id: string;
  author: string;
  tableNumber: number;
  rating: number;
  text: string;
  createdAt: string; // ISO
  helpful: number;
}

const SEED_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Rahul M.",
    tableNumber: 3,
    rating: 5,
    text: "The Hyderabadi Dum Biryani was absolutely phenomenal — layers of flavour, perfect dum seal. The PulseOS ordering made everything so smooth, food arrived fast!",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    helpful: 12,
  },
  {
    id: "r2",
    author: "Priya K.",
    tableNumber: 7,
    rating: 5,
    text: "Galouti Kebab melted in my mouth. The ambience is incredible and the service was attentive throughout. Definitely coming back!",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    helpful: 8,
  },
  {
    id: "r3",
    author: "Aditya S.",
    tableNumber: 2,
    rating: 4,
    text: "Dal Bukhara was rich and creamy, exactly as expected. The smart QR ordering system is a great touch — no waiting for the menu!",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    helpful: 5,
  },
];

function timeAgo(isoStr: string): string {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className={cx(
            "transition-transform",
            !readOnly && "hover:scale-110 cursor-pointer",
            readOnly && "cursor-default"
          )}
          aria-label={readOnly ? undefined : `Rate ${s} star${s > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={cx(
              "transition-colors",
              (hovered || value) >= s ? "fill-amber-400 text-amber-400" : "text-ink-subtle"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ tableNumber }: { tableNumber: number }) {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [helpedIds, setHelpedIds] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || rating === 0) return;

    const now = new Date();
    const newReview: Review = {
      id: `r-${Date.now()}`,
      author: author.trim() || `Guest (Table ${tableNumber})`,
      tableNumber,
      rating,
      text: text.trim(),
      createdAt: now.toISOString(),
      helpful: 0,
    };
    setReviews((prev) => [newReview, ...prev]);
    setSubmitted(true);
    setShowForm(false);
    setText("");
    setAuthor("");
    setRating(5);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const markHelpful = (id: string) => {
    if (helpedIds.has(id)) return;
    setHelpedIds((prev) => new Set([...prev, id]));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r))
    );
  };

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <Panel className="mt-6 p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-line-soft flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={16} className="text-ink-subtle" />
          <div>
            <h2 className="text-sm font-semibold">Guest Reviews</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating value={Math.round(avgRating)} readOnly size={13} />
              <span className="text-xs text-ink-subtle">
                {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => setShowForm((v) => !v)}
          className="text-xs"
        >
          {showForm ? <><X size={13} /> Cancel</> : <><Star size={13} /> Write a review</>}
        </Button>
      </div>

      {/* Submit review form */}
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
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-ink-subtle mb-1.5">Your rating</p>
                  <StarRating value={rating} onChange={setRating} size={24} />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-md border border-line-soft bg-obsidian-800 px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-ink focus:outline-none"
                />
              </div>
              <div>
                <textarea
                  placeholder="Share your experience with us…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-md border border-line-soft bg-obsidian-800 px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-ink focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!text.trim() || rating === 0}
                >
                  <Send size={14} /> Submit review
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Success flash */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-5 mt-4 mb-0 flex items-center gap-2 rounded-lg border border-state-okDim bg-state-okDim/25 px-4 py-3 text-sm"
          >
            <Star size={14} className="fill-state-ok text-state-ok" />
            <span className="text-ink-muted">
              Thank you! Your review has been submitted and is visible to the owner.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      <div className="divide-y divide-line-soft">
        {reviews.map((r) => (
          <div key={r.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-ink">{r.author}</span>
                  <span className="text-xs text-ink-subtle">·</span>
                  <span className="text-xs text-ink-subtle">Table {r.tableNumber}</span>
                  <span className="text-xs text-ink-subtle">·</span>
                  <span className="text-xs text-ink-subtle">{timeAgo(r.createdAt)}</span>
                </div>
                <StarRating value={r.rating} readOnly size={13} />
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{r.text}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => markHelpful(r.id)}
                disabled={helpedIds.has(r.id)}
                className={cx(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
                  helpedIds.has(r.id)
                    ? "border-state-okDim text-state-ok bg-state-okDim/20 cursor-default"
                    : "border-line-soft text-ink-subtle hover:border-line hover:text-ink-muted"
                )}
              >
                <ThumbsUp size={11} />
                Helpful ({r.helpful})
              </button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
