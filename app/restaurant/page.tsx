"use client";

import Navbar from "@/components/Navbar";
import { Panel, PanelHead, Tag, cx } from "@/components/ui/primitives";
import {
  Clock,
  Wallet,
  Bus,
  Plug,
  MapPin,
  Star,
  Utensils,
  Car,
  Wifi,
} from "lucide-react";

/**
 * Public restaurant experience page. Not behind auth — this is the
 * marketing/discovery surface a guest sees before they scan the table QR:
 * location, hours, getting here, ambience gallery, and a 360° tour.
 */

const INFO = [
  { icon: Clock, label: "Dining hours", value: "12:00 – 23:30, daily" },
  { icon: Wallet, label: "Min. spend", value: "₹800 per guest" },
  { icon: Bus, label: "Public transport", value: "Metro MG Road · 4 min walk" },
  { icon: Car, label: "Parking", value: "Valet + street parking available" },
  { icon: Plug, label: "Charging", value: "USB-C + Type-A at every booth" },
  { icon: Wifi, label: "Wi-Fi", value: "Free · 'PulseOS-Guest'" },
];

// Indian fine-dining ambience imagery (royalty-free Unsplash CDN).
const GALLERY = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
];

export default function RestaurantPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12">
        {/* Hero */}
        <div className="mb-10 max-w-[64ch]">
          <div className="eyebrow mb-2">Now serving</div>
          <h1 className="mb-3 text-[clamp(2.25rem,4vw,3rem)]">
            Saffron &amp; Smoke — Modern Indian Kitchen
          </h1>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-state-busyDim px-2 py-0.5 text-sm font-semibold text-state-busy">
              <Star size={13} className="fill-state-busy" /> 4.8
            </span>
            <span className="text-sm text-ink-subtle">· 2,340 reviews · ₹₹₹ · Indian, Tandoor</span>
          </div>
          <p className="text-[1.0625rem] text-ink-muted">
            Clay-oven cooking, slow-cooked handis and dum biryani in a warm, low-lit dining room.
            Book a table, scan in, and let PulseOS keep the kitchen and the floor in sync.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Map */}
          <Panel className="overflow-hidden">
            <PanelHead title="Find us" sub="MG Road, Bengaluru" />
            <iframe
              title="Saffron & Smoke location"
              src="https://www.google.com/maps?q=MG+Road+Bengaluru&output=embed"
              className="h-[360px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Panel>

          {/* Info card */}
          <Panel>
            <PanelHead title="Good to know" />
            <ul className="divide-y divide-line-soft">
              {INFO.map((row) => (
                <li key={row.label} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-obsidian-800 text-ink-muted">
                    <row.icon size={15} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-ink-subtle">
                      {row.label}
                    </div>
                    <div className="text-sm font-medium">{row.value}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line-soft p-5">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=MG+Road+Bengaluru"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-state-calm hover:underline"
              >
                <MapPin size={14} /> Get directions
              </a>
            </div>
          </Panel>
        </div>

        {/* Gallery */}
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Utensils size={16} className="text-ink-subtle" />
            <h2 className="text-lg font-semibold">Inside the room</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {GALLERY.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`Saffron & Smoke ambience ${i + 1}`}
                className="h-44 w-full rounded-lg border border-line-soft object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>


        {/* 360° tour */}
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Tag tone="think">360°</Tag>
            <h2 className="text-lg font-semibold">Take a virtual walk-through</h2>
          </div>
          <Panel className="overflow-hidden">
            {/* Kuula 360° embed — using direct iframe for reliability */}
            <iframe
              className="ku-embed h-[520px] w-full border-0"
              frameBorder="0"
              allow="xr-spatial-tracking; gyroscope; accelerometer"
              allowFullScreen
              scrolling="no"
              src="https://kuula.co/share/hb9t7?logo=1&info=1&fs=1&vr=0&zoom=1&sd=1&autorotate=0.24&thumbs=1&alpha=0.60"
              title="Saffron & Smoke 360° Virtual Tour"
            />
          </Panel>
          <p className="mt-2 text-sm text-ink-subtle">
            Drag to look around. On mobile, the tour also supports VR headsets.
          </p>
        </div>

      </main>
    </>
  );
}
