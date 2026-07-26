"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Cpu, Settings } from "lucide-react";
import { usePulseStore } from "@/lib/store/usePulseStore";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/operations", label: "Operations & Floor", icon: ClipboardList },
  { href: "/customer", label: "Guest Ordering", icon: UtensilsCrossed },
  { href: "/ai-ops", label: "AI Intelligence", icon: Cpu },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const governor = usePulseStore((state) => state.governor);
  const modeLabel =
    governor.provider_mode === "demo"
      ? "Demo Mode (Simulated)"
      : governor.provider_mode === "env"
      ? "Server ENV Key"
      : "Personal API Key";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-obsidian-950/90 backdrop-blur-md font-sans">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="PulseOS overview">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-pulse-violet to-pulse-cyan flex items-center justify-center font-extrabold text-white text-sm shadow-md">
            P
          </div>
          <div className="hidden sm:block">
            <span className="block text-sm font-bold tracking-tight text-white">PulseOS</span>
            <span className="block text-[10px] font-mono text-pulse-violet">Restaurant Intelligence</span>
          </div>
        </Link>

        {/* Linear Guided Navigation */}
        <nav aria-label="Primary navigation" className="flex min-w-0 items-center gap-1.5 overflow-x-auto font-mono text-xs">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 font-medium transition-all ${
                  active
                    ? "bg-pulse-violet/20 border border-pulse-violet/40 text-white shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 text-pulse-cyan" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Governor Status Pill */}
        <Link
          href="/settings"
          className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-obsidian-900 px-3 py-2 text-xs font-mono text-slate-300 hover:border-pulse-violet transition-all sm:inline-flex"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              governor.provider_mode === "demo" ? "bg-pulse-amber" : "bg-pulse-emerald animate-pulse"
            }`}
          />
          <span>{modeLabel}</span>
        </Link>
      </div>
    </header>
  );
}
