/**
 * Lighthouse CI, configured for a mid-range Android on Slow 4G — not
 * desktop — per docs/fix-prompts.md's Session 4 spec.
 *
 * Runs against a locally-built production server (see .github/workflows/
 * ci.yml), not a Vercel preview deployment: Vercel's Deployment Protection
 * puts an SSO wall in front of every preview URL, which Lighthouse CI can't
 * authenticate through. The alternative — a Deployment Protection bypass
 * token stored as a GitHub secret — was rejected: it's an extra secret to
 * provision and rotate, and it would make this job depend on the preview
 * deploy for the same commit already existing (a race with Vercel's own
 * build) rather than just needing `next build` to succeed. A local
 * `next build && next start` gives the same production bundle Lighthouse
 * would see on Vercel; the one real gap is Vercel's edge network itself
 * (actual TTFB/CDN behavior), which this can't measure — worth revisiting
 * with a bypass token later if that gap matters enough to the college.
 *
 * INP has no assertion below: Lighthouse's lab runs don't perform real
 * interactions, so it can't produce a lab INP number the way it can for
 * LCP/CLS/TBT — Total Blocking Time is asserted instead, as the standard
 * lab proxy for input responsiveness.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 30000,
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/programmes",
        "http://localhost:3000/programmes/bsc-information-technology",
      ],
      numberOfRuns: 3,
      settings: {
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 2.625,
          disabled: false,
        },
        throttlingMethod: "simulate",
        // Lighthouse's own "Slow 4G" throttling preset.
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150 * 3.75,
          downloadThroughputKbps: 1638.4 * 0.9,
          uploadThroughputKbps: 750 * 0.9,
        },
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 1 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "server-response-time": ["error", { maxNumericValue: 800 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        // Meaningful mainly for "/" (the "homepage total < 1.5MB" budget) —
        // applied to every collected URL since lhci's assertion matrix
        // doesn't have a lighter-weight way to scope one assertion to one
        // URL than a separate assert config per URL.
        "resource-summary:total:size": ["error", { maxNumericValue: 1572864 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
