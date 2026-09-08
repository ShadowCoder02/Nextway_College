import { defineConfig, devices } from "@playwright/test";
import { readFileSync, existsSync } from "fs";
import path from "path";

// Next.js loads .env.local automatically for the server process it starts
// (via webServer below), but this config/test-runner process is separate
// Node process that doesn't — load it here too so tests that need real
// local secrets (e.g. ADMIN_PASSWORD, overridden in .env.local) can read
// them via process.env, same as the server does.
//
// Must strip matching quotes around a value the same way Next's own env
// loader (and dotenv generally) does. Without this, a quoted value (e.g.
// `KEY="value"`, which `vercel env pull` writes) gets the literal quote
// characters included in process.env here — and since the webServer child
// process below inherits this process's env, Next's own loader then skips
// re-parsing that key from .env.local (dotenv convention: don't override
// an already-set var), so the corrupted value with embedded quotes
// silently reaches both the test runner AND the app server. Confirmed as
// the root cause of a real failure: a quoted secret passed this way was
// rejected by its provider as invalid, and a quoted ADMIN_PASSWORD would
// have failed portal login the same way.
function stripMatchingQuotes(value: string): string {
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1);
  }
  return value;
}

const envLocalPath = path.join(__dirname, ".env.local");
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, "utf-8").split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match && !(match[1] in process.env)) process.env[match[1]] = stripMatchingQuotes(match[2]);
  }
}

// Runs against a locally built production server, not the Vercel preview —
// same reasoning as .lighthouserc.js: Vercel's Deployment Protection puts
// an SSO wall in front of every preview URL that Playwright can't
// authenticate through, and a local `next build && next start` gives the
// same production bundle without an extra bypass-token secret to manage.
export default defineConfig({
  testDir: "./e2e",
  // Serial, single-worker on purpose (code-review finding, not the
  // Playwright default): this suite shares two pieces of real, unguarded
  // mutable state across tests — the CMS admissions store (src/lib/cms/
  // json-store.ts: a Supabase read→modify→write with no locking;
  // concurrent registerAndVerifyApplicant() calls can silently drop each
  // other's write, same lost-update risk as the local-fs version this
  // replaced) and the in-memory per-IP rate limiter (every local
  // Playwright request shares the same "local" identity, since
  // x-forwarded-for is never set) — Suite 5's rate-limit test deliberately
  // floods /api/enquiries, which would 429 any *other* test's enquiry
  // submission landing in the same window. Trading parallel speed for a
  // suite that doesn't intermittently fail itself.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    },
  },
});
