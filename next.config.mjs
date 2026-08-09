import createMDX from "@next/mdx";
import bundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 90],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Compress responses
  compress: true,
  // The framework announced itself on every response. Nothing needs to know.
  poweredByHeader: false,
  async headers() {
    // Production sent no security headers at all.
    //
    // Strict-Transport-Security is deliberately ABSENT. It is on founder hold
    // until the zone's full hostname inventory is confirmed, because HSTS is
    // hard to withdraw once a browser has cached it, and includeSubDomains
    // would extend that to hosts whose HTTPS capability is unverified. No
    // preload either. The scheme upgrade is handled by src/middleware.ts, which
    // is reversible.
    //
    // Content-Security-Policy is also absent by choice: a policy shipped
    // blind breaks pages, and it deserves a report-only rollout of its own
    // rather than being smuggled into a QA release.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/our-story",
        permanent: true,
      },
      {
        source: "/articles/well-aging-not-anti-aging",
        destination: "/journal",
        permanent: true,
      },
      {
        source: "/products",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/founders-access",
        destination: "/founder-access",
        permanent: true,
      },
      {
        // /learn was a second, older Science experience. One authoritative
        // Science surface; the redirect keeps old inbound links working.
        source: "/learn",
        destination: "/science",
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(withMDX(nextConfig));
