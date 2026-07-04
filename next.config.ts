import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Inline critical CSS — removes the render-blocking stylesheet fetch
    // that gates the published sites' LCP (ADR-033 performance pass).
    inlineCss: true,
  },
  images: {
    // Generated media lives in Supabase Storage (ADR-033); next/image
    // serves it same-origin, per-viewport sized, AVIF-first.
    formats: ["image/avif", "image/webp"],
    qualities: [45, 60, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
