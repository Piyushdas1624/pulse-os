/**
 * Shared time formatters. Keeps all live timestamps in a consistent
 * 12-hour AM/PM format, and provides a relative-time helper for demo
 * (seeded) data so it reads "about an hour ago" rather than a fixed
 * random 24h stamp.
 */

const TIME_OPTS: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

/** "7:48 PM" — live current time, 12-hour with AM/PM. */
export function nowTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("en-US", TIME_OPTS);
}

/** "7:48 PM" from an ISO string or epoch. */
export function formatTime(iso: string | number | Date): string {
  return new Date(iso).toLocaleTimeString("en-US", TIME_OPTS);
}

/** "30 Jul 2026" from an ISO string or epoch. */
export function formatDate(iso: string | number | Date): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "30 Jul 2026, 7:48 PM" — full timestamp. */
export function formatDateTime(iso: string | number | Date): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

/**
 * A deterministic "a little while ago" stamp for demo/seed data. Returns a
 * 12-hour AM/PM time offset from now by `minutesAgo`, so seeded events read
 * as recent and close to the user's real clock instead of a fixed 18:42.
 */
export function demoTimeAgo(minutesAgo: number, base: Date = new Date()): string {
  const d = new Date(base.getTime() - minutesAgo * 60_000);
  return nowTime(d);
}

/**
 * Full demo timestamp (date + 12h time) offset from now, for seeded orders /
 * history so they sit on the current date near the user's real time.
 */
export function demoDateTimeAgo(minutesAgo: number, base: Date = new Date()): string {
  const d = new Date(base.getTime() - minutesAgo * 60_000);
  return d.toISOString();
}
