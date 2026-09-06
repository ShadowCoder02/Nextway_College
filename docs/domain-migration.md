# Moving off nextway-college.vercel.app

**This is a business decision, not a technical one — flagging for the college, not something Session 4 (or any engineering session) should decide unilaterally.**

## Recommendation

Acquire a real `.lk` domain (e.g. `nextwaycollege.lk` or similar) before the next
public marketing push. A `.vercel.app` domain:

- Carries no institutional credibility for a higher-education provider —
  prospective students and parents commonly treat it as a red flag.
- Is blocked outright on some corporate/ISP networks and school filtering
  systems in Sri Lanka, cutting off a segment of the target audience.
- Cannot appear on official documents (admission letters, printed materials,
  signage) without looking unfinished.

## What the move actually requires (once a domain is chosen)

Every route path stays identical — this is a domain swap, not a URL
restructure — so there is no per-path redirect table to maintain. The work is:

1. **Add the domain in Vercel** (Project Settings → Domains) and point its
   DNS at Vercel per their instructions.
2. **Set `NEXT_PUBLIC_SITE_URL`** to the new domain in the Production
   environment variable (flagged as a TODO since Session 1 — see
   `src/constants/site.ts`'s `resolveSiteUrl()`, which already refuses to
   build without it). This one variable drives canonical URLs, Open Graph
   tags, `robots.txt`, and `sitemap.xml` — nothing else needs updating.
3. **Set `nextway-college.vercel.app` to redirect to the new domain** —
   Vercel's own domain redirect feature (Project Settings → Domains → add
   the `.vercel.app` domain back as a "Redirect to" target) issues a 308/301
   at the platform level for every path automatically. No application code
   or route-level redirect logic is needed.
4. **Update external references once the new domain is live**: Google
   Search Console (add + verify the new property, submit the new sitemap),
   any social profile links once they exist (currently empty pending real
   URLs — see `content/TODO-content.md`), and printed/offline materials.
5. **Re-run Lighthouse CI and the security-headers check** against the new
   domain once cut over, since HSTS and CSP are origin-scoped.

## Timing

Cheapest to do before running paid acquisition or print campaigns pointing at
the current `.vercel.app` URL — every redirect adds latency and a small
percentage of link-clickers who don't follow redirects. No technical
blocker exists today; the sole blocker is the college choosing and
purchasing a domain.
