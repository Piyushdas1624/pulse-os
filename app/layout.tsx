import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseOS - AI-Powered Restaurant Operating Intelligence Platform",
  description:
    "Realtime operational intelligence platform predicting restaurant bottlenecks, batching kitchen tickets, and optimizing restaurant workflows in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-obsidian-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
