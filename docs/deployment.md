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

1. Set `NEXT_PUBLIC_SITE_URL` to production domain.
2. Add custom domain in Vercel → Domains.
3. Update DNS (A/CNAME records as shown by Vercel).
4. Enable HTTPS (automatic on Vercel).
5. Submit sitemap to Google Search Console: `https://yourdomain.lk/sitemap.xml`

## Supabase production

1. Use a dedicated Supabase project for production (not dev).
2. Run migration: `supabase/migrations/001_initial_schema.sql`
3. Configure Auth email templates if using magic links.
4. Restrict RLS — never expose service role key in frontend.

## Optional: Analytics

- Add Google Analytics 4 script via `next/script` in root layout when ready.
- Register property in Search Console after DNS is live.

## Rollback

Vercel keeps deployment history — promote a previous deployment from the dashboard if needed.
