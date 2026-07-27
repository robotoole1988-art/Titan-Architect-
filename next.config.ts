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
    // The media law's rendition ladder (§4). Next's default offers EIGHT
    // widths up to 3840; measured against the live hero, every width from
    // 1080 up returned the same 33KB — the source is not that big — so the
    // extra rungs bought nothing and split the optimiser's cache across
    // eight keys per image. Fewer, larger buckets means a cold region is
    // far likelier to serve a HIT, and a cold optimiser MISS is transcode
    // time spent on the LCP path.
    deviceSizes: [640, 960, 1280, 1920],
    imageSizes: [384],
    // Optimised renditions cache for a month (media law): generated assets
    // are immutable in practice — a regeneration is a new asset via the
    // media gate, never an overwrite. Without this, optimised images fall
    // back to short upstream TTLs and repeat visits re-download the site.
    minimumCacheTTL: 2678400,
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
