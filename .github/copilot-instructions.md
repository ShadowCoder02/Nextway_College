# Review guidance for this repo

This is a Next.js App Router site for a Sri Lankan college. When reviewing PRs,
flag these specifically — all have been real defects here:

1. Any phone validation requiring exactly 10 digits. It breaks the Kandy
   landline 0812201650. Require E.164 normalisation via libphonenumber-js
   with 'LK' as the default region.
2. Any date formatted without timeZone: 'Asia/Colombo'. The server runs UTC;
   an unpinned date shows the 9:00 AM open day as 3:30 AM and causes
   hydration mismatches.
3. Any name/text validation with a Latin-only character class. Tamil and
   Sinhala input must pass.
4. Any required-field check that only tests `!== ''` — whitespace passes it.
5. Any hardcoded localhost URL, or metadata that doesn't resolve through
   metadataBase.
6. Any 'use client' at page level. It silently kills that page's metadata.
7. Any next/image with `fill` and no `sizes` prop.
8. Any user input rendered without escaping, including in email templates and
   admin views.
9. Any portal data query that doesn't scope to the authenticated user's ID.
10. Any CSV export that doesn't neutralise leading = + - @ in cell values.
11. Any invented curriculum, fees, entry requirements or accreditation text.
    These must be TODO(content) markers.
