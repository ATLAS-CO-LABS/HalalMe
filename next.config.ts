import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// Only these first-party origins may read cross-origin API responses. Every
// real page in this app calls its own API with a relative path (same-origin,
// unaffected by CORS either way) — this exists purely to stop other websites'
// JS from reading responses from our API. It does NOT block direct/non-browser
// requests (curl, bots) — that's what rate limiting is for.
const ALLOWED_ORIGINS = [
  "https://halalme.co.uk",
  "https://www.halalme.co.uk",
  "https://kitchen.halalme.co.uk",
  "https://social.halalme.co.uk",
  "https://rewards.halalme.co.uk",
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Report-only for now (WA-47) — logs violations to the browser console
// without blocking anything, so we can see what a real enforcing policy
// would break before switching it on. 'unsafe-inline' stays on script-src
// and style-src because the app relies on inline <Script> (theme init) and
// inline style={{}} props throughout — tightening to a nonce-based policy
// is a follow-up once the report period confirms no origins are missing.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://www.themealdb.com https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.ingest.de.sentry.io https://vitals.vercel-insights.com",
  "frame-src https://js.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.halalme.co.uk" }],
        destination: "https://halalme.co.uk/:path*",
        // Next.js only supports 307/308 for config-level redirects (no raw
        // 301/302) — permanent:true issues a 308, which search engines treat
        // as an equivalent permanent redirect to a 301.
        permanent: true,
      },
      // WA-30: Hub was renamed to Social. Old /hub links (bookmarks, search
      // results, backlinks) still need to land somewhere.
      {
        source: "/hub",
        destination: "/social",
        permanent: true,
      },
      {
        source: "/hub/:path*",
        destination: "/social/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    const corsHeaders = ALLOWED_ORIGINS.map((origin) => ({
      source: "/api/:path*",
      has: [{ type: "header" as const, key: "origin", value: `^${escapeRegex(origin)}$` }],
      headers: [
        { key: "Access-Control-Allow-Origin", value: origin },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        { key: "Access-Control-Allow-Credentials", value: "true" },
      ],
    }));

    const securityHeaders = {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
        { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
      ],
    };

    return [...corsHeaders, securityHeaders];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'www.themealdb.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "halalme-delivery-ltd",

  project: "javascript-nextjs-zo",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
