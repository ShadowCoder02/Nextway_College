import type { NextConfig } from "next";

// Report-only for now: the codebase leans on inline `style={{...}}` (progress
// bars, PageHero backgrounds) and CSP's style-src has no per-origin way to
// allow just those, so a straight switch to enforcing would either break
// legitimate inline styles or require a wider refactor than this pass. This
// still surfaces real violations (a future injected <script>, an
// unexpected third-party origin) via the browser's reporting API without
// risking breakage — the deliberate first phase the task asked for.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com https://*.supabase.co https://*.public.blob.vercel-storage.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy-Report-Only", value: CSP_DIRECTIVES },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  // pdfkit resolves its default/built-in font at PDFDocument construction
  // time via a Node subpath-imports wildcard (#standard-fonts/*, mapped in
  // pdfkit's own package.json) — this crashes in production the moment a
  // PDFDocument is created, before any application code even runs, so
  // switching every doc.font() call in pdf.ts to custom embedded fonts
  // didn't help. Two separate problems, both confirmed via production
  // logs, both needed together:
  //   1. Next bundling pdfkit into the route's compiled output broke
  //      Node's ability to resolve the #standard-fonts/* mapping at all
  //      ("Cannot find module '#standard-fonts/Helvetica'").
  //      serverExternalPackages excludes it from bundling so Node
  //      resolves it natively from a real node_modules at runtime, where
  //      its own package.json "imports" map works correctly — the
  //      standard fix for packages with dynamic/non-static requires.
  //   2. Once resolution itself worked, the error changed to a concrete
  //      missing file ("Cannot find module '.../standard-fonts/
  //      Helvetica.cjs'") — Vercel's build tracer still doesn't ship that
  //      directory by default even for an external package.
  //      outputFileTracingIncludes below adds it back explicitly.
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/**/*": ["node_modules/pdfkit/js/standard-fonts/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
