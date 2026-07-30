import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import GovernorHydrator from "@/components/GovernorHydrator";
import { ToastHost } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/firebase/AuthContext";

/* One family, three weights. Self-hosted by next/font, zero layout shift. */
const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PulseOS — Restaurant Operating Intelligence",
  description:
    "Live floor state, kitchen load and grounded AI recommendations for a single venue.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${sans.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {/* Reads the encrypted provider config out of localStorage and pushes
              it into the Zustand store once, on mount. Without this a refresh
              silently resets the app to Demo. */}
          <GovernorHydrator />
          {children}
          <ToastHost />
        </AuthProvider>
      </body>
    </html>
  );
}

