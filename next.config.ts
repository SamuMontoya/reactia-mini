import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `x-powered-by: Next.js` on any response.
  poweredByHeader: false,
  // No on-screen framework indicator. It is dev-only, but this makes the
  // intent explicit so it can never surface to a user.
  devIndicators: false,
};

export default nextConfig;
