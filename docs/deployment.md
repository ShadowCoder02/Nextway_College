# Deployment guide

## Staging (Vercel)

1. **Repository** — push the `NWC` folder to GitHub (or connect Vercel to local repo).

2. **Vercel project**
   - Framework preset: Next.js
   - Root directory: `.` (or `NWC` if monorepo)
   - Build command: `npm run build`
   - Output: default

3. **Environment variables** (Vercel → Settings → Environment Variables)

   | Variable | Example |
   |----------|---------|
   | `NEXT_PUBLIC_SITE_URL` | `https://staging.nextwaycollege.lk` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |

4. Deploy and test:
   - All nav links
   - Programme search/filters
   - Enquiry form → Supabase `enquiries` table
   - Admin login at `/admin/login`
   - Mobile layout

## Production

1. Set `NEXT_PUBLIC_SITE_URL` in Vercel's **Production** environment scope.
   Currently `https://nextway-college.vercel.app` until the real `.lk` domain
   lands — update this value (and the sitemap submission below) when it does.
   The build fails if this is unset in production.
2. Add custom domain in Vercel → Domains.
3. Update DNS (A/CNAME records as shown by Vercel).
4. Enable HTTPS (automatic on Vercel).
5. Submit sitemap to Google Search Console: `<NEXT_PUBLIC_SITE_URL>/sitemap.xml`

## Supabase production

1. Use a dedicated Supabase project for production (not dev).
2. Run migration: `supabase/migrations/001_initial_schema.sql`
3. Configure Auth email templates if using magic links.
4. Restrict RLS — never expose service role key in frontend.

## Analytics & performance monitoring

`@vercel/speed-insights` and `@vercel/analytics` are already wired into
`src/app/layout.tsx` on every page. They activate automatically once
enabled for this project under Vercel → Speed Insights / Analytics — no
further code changes needed. (A Google Analytics 4 script can still be
added via `next/script` alongside these if the college specifically needs
GA4, but Vercel's first-party options cover Core Web Vitals and traffic
without a separate script.)

## Error monitoring (Sentry) — not yet installed

`@sentry/nextjs` was tried and deliberately reverted: even initialized with
no DSN (a complete no-op), it added ~73KB to every route's First Load JS and
~57KB to the Edge Middleware bundle — for a mid-range-Android audience, that
cost isn't justified by a feature that does nothing without a Sentry
project, which doesn't exist yet for this app. Add it when there's an
actual account to send errors to, not before:

1. Create a project at https://sentry.io (Platform: Next.js).
2. Run `npx @sentry/wizard@latest -i nextjs` from the project root — it
   scaffolds `instrumentation.ts`/`instrumentation-client.ts` and the
   server/edge config files correctly for the installed SDK version, and
   wires source-map upload (`SENTRY_AUTH_TOKEN`, org/project) for you.
3. Re-check First Load JS afterward (`npm run build`) — the SDK's default
   config enables tracing and session replay, both of which add
   meaningfully to bundle size; consider trimming `tracesSampleRate` and
   disabling replay if the budget in this doc's Lighthouse CI job is tight.

## Rollback

Vercel keeps deployment history — promote a previous deployment from the dashboard if needed.
