import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Scoped to validation and data-selector modules per the regression
      // suite's coverage requirement — not the whole codebase. Excludes
      // src/services/admissions.ts and enquiries.ts: those are mutating,
      // side-effecting services (email sending, password hashing, session
      // creation, rate limiting) rather than pure "selector" functions —
      // covering them meaningfully means Playwright/integration tests
      // against a real server (see e2e/), not a coverage-threshold unit
      // test with everything mocked.
      include: [
        "src/lib/validation.ts",
        "src/lib/account-validation.ts",
        "src/lib/staff-login-validation.ts",
        "src/lib/phone.ts",
        "src/lib/phone-schema.ts",
        "src/lib/common-passwords.ts",
        "src/services/programmes.ts",
        "src/services/events.ts",
        "src/services/news.ts",
        "src/services/careers.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
