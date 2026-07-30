"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LogOut, User, KeyRound } from "lucide-react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { isLiveProvider, activeModelLabel } from "@/lib/ai/providerState";
import { Pill, Tag, cx } from "@/components/ui/primitives";
import { useAuth, UserRole } from "@/lib/firebase/AuthContext";

type NavLink = { href: string; label: string; roles: UserRole[] };

const LINKS: NavLink[] = [
  { href: "/", label: "Overview", roles: ["owner", "manager", "kitchen_staff"] },
  { href: "/operations", label: "Operations", roles: ["owner", "manager", "kitchen_staff"] },
  { href: "/orders", label: "Orders", roles: ["owner", "manager", "kitchen_staff"] },
  { href: "/staff", label: "Staff", roles: ["owner", "manager"] },
  { href: "/restaurant", label: "Restaurant", roles: ["owner", "manager", "kitchen_staff", "customer"] },
  { href: "/customer", label: "Guest ordering", roles: ["owner", "manager", "kitchen_staff", "customer"] },
  { href: "/qr", label: "QR codes", roles: ["owner", "manager"] },
  { href: "/ai-ops", label: "AI advisor", roles: ["owner", "manager"] },
  { href: "/settings", label: "Settings", roles: ["owner", "manager"] },
];

export default function Navbar() {
  const pathname = usePathname();
  const governor = usePulseStore((s) => s.governor);
  const { user, profile, signOut } = useAuth();

  // reads the store, same as every other surface. no local copy, no drift.
  const live = isLiveProvider(governor);
  const role = profile?.role;
  const visibleLinks = role ? LINKS.filter((l) => l.roles.includes(role)) : [];

  return (
    <header className="sticky top-0 z-20 border-b border-line-soft bg-obsidian-900">
      <div className="mx-auto flex max-w-[1360px] items-center gap-6 px-6 py-3 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-[26px] w-[26px] place-items-center rounded-md bg-ink">
            <Activity size={15} className="text-obsidian-900" />
          </span>
          <span className="text-[1.0625rem] font-semibold tracking-[-0.03em]">
            Pulse<span className="font-normal text-ink-subtle">OS</span>
          </span>
        </Link>

        <nav
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
          aria-label="Primary"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {visibleLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "whitespace-nowrap rounded px-2.5 py-1.5 text-sm font-medium shrink-0",
                  "transition-colors duration-150 ease-out-quart",
                  active
                    ? "bg-obsidian-800 text-ink"
                    : "text-ink-muted hover:bg-obsidian-850 hover:text-ink"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Pill tone={live ? "live" : "demo"}>
            <span className="block max-w-[120px] truncate text-[10px]">
              {live ? `${activeModelLabel(governor)} · live` : "Demo mode"}
            </span>
          </Pill>

          {user ? (
            <div className="flex items-center gap-2.5 border-l border-line-soft pl-3">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-ink">
                  {profile?.displayName || user.displayName || user.email?.split("@")[0] || "User"}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-subtle">
                  {profile?.role || "guest"}
                </span>
              </div>
              <button
                onClick={signOut}
                title="Sign Out"
                className="grid h-8 w-8 place-items-center rounded-lg border border-line-soft bg-obsidian-800 text-ink-muted transition-colors hover:border-line-loud hover:text-ink"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-obsidian-900 transition-all hover:bg-white active:scale-[0.985]"
            >
              <KeyRound size={13} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

