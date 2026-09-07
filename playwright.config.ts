import { defineConfig, devices } from "@playwright/test";
import { readFileSync, existsSync } from "fs";
import path from "path";

// Next.js loads .env.local automatically for the server process it starts
// (via webServer below), but this config/test-runner process is separate
// Node process that doesn't — load it here too so tests that need real
// local secrets (e.g. ADMIN_PASSWORD, overridden in .env.local) can read
// them via process.env, same as the server does.
const envLocalPath = path.join(__dirname, ".env.local");
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, "utf-8").split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2];
  }
}

// Runs against a locally built production server, not the Vercel preview —
// same reasoning as .lighthouserc.js: Vercel's Deployment Protection puts
// an SSO wall in front of every preview URL that Playwright can't
// authenticate through, and a local `next build && next start` gives the
// same production bundle without an extra bypass-token secret to manage.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
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
