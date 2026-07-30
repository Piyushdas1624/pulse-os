import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Firebase popup auth (signInWithPopup) opens a window and polls
  // popupWindow.closed from the opener. A restrictive COOP blocks that
  // cross-origin call and spams "Cross-Origin-Opener-Policy policy would
  // block the window.closed call" in the console. same-origin-allow-popups
  // is Firebase's documented fix.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
