import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `x-powered-by: Next.js` on any response.
  poweredByHeader: false,
  // No on-screen framework indicator. It is dev-only, but this makes the
  // intent explicit so it can never surface to a user.
  devIndicators: false,
  // Dev-mode previews get opened from a non-localhost origin — the phone's
  // LAN IP, or an ngrok domain — and without this, Next.js blocks the dev
  // client's cross-origin requests (HMR websocket among them) from any
  // origin but localhost. That block was silently preventing React from
  // ever finishing hydration on-device: every native HTML element still
  // rendered and looked right, but no onClick/onChange ever got wired up,
  // which is why dropdowns and the gatekeeping form's submit button did
  // nothing but fall back to a plain HTML form GET. `*.ngrok-free.app`
  // covers ngrok's random per-run subdomains; the LAN IP covers same-WiFi
  // device previews.
  allowedDevOrigins: ['*.ngrok-free.app', '192.168.40.62'],
};

export default nextConfig;
