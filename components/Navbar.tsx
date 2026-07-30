"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LogOut, User, KeyRound } from "lucide-react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { isLiveProvider, activeModelLabel } from "@/lib/ai/providerState";
import { Pill, Tag, cx } from "@/components/ui/primitives";
import { useAuth } from "@/lib/firebase/AuthContext";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/operations", label: "Operations" },
  { href: "/staff", label: "Staff" },
  { href: "/orders", label: "Orders" },
  { href: "/customer", label: "Guest ordering" },
  { href: "/ai-ops", label: "AI advisor" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const governor = usePulseStore((s) => s.governor);
  const { user, profile, signOut } = useAuth();

  // reads the store, same as every other surface. no local copy, no drift.
  const live = isLiveProvider(governor);

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

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Primary">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "whitespace-nowrap rounded px-3 py-2 text-sm font-medium",
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
            {live ? `${activeModelLabel(governor)} · live` : "Demo mode"}
          </Pill>

          {user ? (
            <div className="flex items-center gap-2.5 border-l border-line-soft pl-3">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-ink">
                  {profile?.displayName || user.displayName || user.email?.split("@")[0] || "User"}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-subtle">
                  {profile?.role || "Manager"}
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

