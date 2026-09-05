# Nextway College International — project context

Next.js App Router site on Vercel for a Sri Lankan higher education provider.
Audience: prospective students in Sri Lanka, mostly mid-range Android on 4G.
Production domain: TODO (currently nextway-college.vercel.app).

## Non-negotiables
- All dates and times render via the shared date module with
  timeZone: 'Asia/Colombo'. Never call toLocaleDateString directly.
- Phone validation must accept the college's own Kandy landline, 0812201650 —
  9 digits after the leading zero. Never write a "must be 10 digits" rule.
- Name fields must accept Tamil (நித்தர்சன்) and Sinhala (සමන් පෙරේරා) script.
  The college advertises Tamil-medium delivery.
- Never invent institutional content: curriculum modules, entry requirements,
  durations, fees, accreditation claims, branch addresses, testimonials.
  Leave TODO(content) markers and add the item to content/TODO-content.md.
- Pages stay server components. Interactive parts become small client islands.
  A client component cannot export metadata.
- The portal stores NIC and passport scans. Treat every portal endpoint as
  security-sensitive.

## Commands
- npm run dev / build / test / test:e2e / lint / typecheck
