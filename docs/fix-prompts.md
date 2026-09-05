# Fixing Nextway College — Claude Code + GitHub Copilot

Companion to `nextway-college-audit.md`. All five workstreams from the previous
pack, redistributed across the two tools you actually use.

---

## How the two tools divide the work

They have genuinely different strengths, so don't treat them as interchangeable:

**Claude Code is the builder.** It reads the whole repo, holds a plan across many
files, and does cross-cutting refactors. Everything that changes source code goes
here — four sequential sessions, one branch and one PR each.

**Copilot is the reviewer and the test author.** Its code review on pull requests
catches what Claude Code drifted on, and its agent mode is well suited to writing
a large volume of independent test cases. It's also the tool already sitting in
your editor for small follow-ups.

```
Session 1 (Claude Code) ──> PR ──> Copilot review ──> merge
Session 2 (Claude Code) ──> PR ──> Copilot review ──> merge
Session 3 (Claude Code) ──> PR ──> Copilot review ──> merge
Session 4 (Claude Code) ──> PR ──> Copilot review ──> merge
                                        │
        Copilot test suite ─────────────┘  (start after Session 2)
```

Run the sessions in order. Session 1 changes the shape of the programme and event
data; if 2, 3 or 4 run first they'll build on something that's about to move.

---

## Step 0 — Set up both tools' memory first (15 minutes, saves hours)

Neither tool remembers the audit between sessions. Give each a persistent context
file so you're not re-explaining the project four times, and so Copilot's reviewer
knows the traps specific to this codebase.

### `CLAUDE.md` in the repo root

```md
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
```

### `.github/copilot-instructions.md`

```md
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
```

Then turn on Copilot code review for the repo so it comments automatically on
every PR rather than you remembering to ask.

---

## Claude Code — Session 1
### Data integrity and configuration (all P0 bugs)

Branch: `fix/p0-data-integrity`

```
You are working on the Nextway College International website — a Next.js App
Router site on Vercel for a Sri Lankan higher education provider. Read CLAUDE.md
first.

Before changing anything, explore the repo and report back: where programme, news
and event data lives (JSON, TS constants, MDX, or a CMS), how metadata is
configured, which pages are client vs server components, and whether next/image
is in use. Show me that map and wait for my confirmation.

Then fix these eight confirmed defects, in order, committing separately. After
each, tell me the exact URL and steps to verify it manually.

1. METADATA BASE POINTS AT LOCALHOST
   Every page returns canonical and og:url as http://localhost:3000, and
   og:image as http://localhost:3000/brand/logo-icon.png. This blanks every
   WhatsApp, Facebook and LinkedIn share preview — and WhatsApp is this college's
   primary channel.
   - Add one resolved site-URL helper used by metadataBase in the root layout:
     production -> NEXT_PUBLIC_SITE_URL, preview -> https://${VERCEL_URL},
     local -> http://localhost:3000.
   - Fail the production build loudly if NEXT_PUBLIC_SITE_URL is unset, rather
     than silently falling back.
   - Verify every page's canonical, og:url, og:image and twitter:image become
     absolute production URLs.
   - Tell me the exact Vercel env var and scope to set.

2. FOUR PROGRAMME IMAGES RETURN 404
   Fabricated Unsplash IDs. Confirmed dead: photo-1529107384806-3a0a4a0a0a0a
   (BA Political Science), photo-1503454537194-1dd5c0c0c0c0 (Diploma in
   Preschool). Suspect: photo-1450101499168-0f0c0c0c0c0c (Law College Entrance
   Training), photo-1546410535-e1343712f4a0 (BA Tamil).
   - Write scripts/check-images.ts that requests every image URL in the data
     files and reports non-200s. Run it, give me the full list.
   - Replace dead URLs with local placeholders at
     /public/images/programmes/<slug>.jpg and record each in
     content/TODO-content.md as needing real photography.
   - Add an onError fallback so a dead image never renders a broken frame.
   - Do NOT substitute different Unsplash IDs; we're moving off third-party
     image hosting in Session 4.

3. SCHOOL FILTER CAN NEVER RETURN RESULTS
   /programmes filters by School (Computing & IT, Business & Management,
   Language & Communication, Hospitality & Tourism), but every programme's
   `school` field contains "Nextway College International" instead of a school
   name. Every school filter returns zero — including Computing & IT, while the
   BSc IT sits one click away as the flagship.
   - Add a typed School union and a schools registry (id, name, slug).
   - Assign each of the 10 programmes to its correct school. Where genuinely
     ambiguous, leave TODO(content) and ask me — do not guess.
   - Render filter options from data with live counts; disable-with-count (not
     hide) any school with zero programmes.
   - Report to me: two of the four schools have no programmes at all, and the
     page copy promises "business" and "hospitality" pathways that don't exist.

4. EVENT TIMES RENDER IN UTC
   The Kandy Open Day shows as "September 12, 2026 at 3:30 AM". Sri Lanka is
   UTC+5:30 — that's 9:00 AM local. Every event time on the site is wrong.
   - Create one date-formatting module, locale 'en-LK', timeZone 'Asia/Colombo'.
   - Grep for every toLocaleDateString, toLocaleString, Intl.DateTimeFormat,
     date-fns format and dayjs call, and route them all through it.
   - Store event timestamps as ISO 8601 with an explicit +05:30 offset.
   - This also removes a hydration-mismatch risk: Vercel runs UTC, the client
     runs device-local.

5. A PAST EVENT IS LISTED AS UPCOMING
   /events shows "BSc IT Information Session — August 28, 2026" unlabelled,
   while the homepage correctly excludes it. Two components, two rules, one
   dataset.
   - Add shared getUpcomingEvents() / getPastEvents() selectors used by both.
   - /events renders "Upcoming" and "Past events" as separate sections.
   - Both need a real empty state, not a blank region.
   - Compare against Asia/Colombo, not server UTC midnight.

6. THE PROGRAMME PARAMETER IS SILENTLY DROPPED
   Programme pages link to /apply?programme=<slug>, but /apply renders
   identically to the bare URL, and its "Start New Application" button links to a
   bare /apply/register — discarding it before registration begins. This is the
   highest-intent click on the site.
   - /apply reads the param, validates the slug against the catalogue, renders
     "You're applying for <Programme>. [Change programme]".
   - Unknown or malformed slugs fall back silently — no crash, no reflected
     output. Test ?programme=<script>alert(1)</script>.
   - Forward to /apply/register and persist (sessionStorage + a server-side
     draft) so it survives register -> verify -> login and pre-selects later.

7. EMPTY AND DUPLICATED PROGRAMME CONTENT
   On /programmes/bsc-information-technology the same 12-word sentence is the
   Overview, the "Why this programme" body and the meta description. The
   "Curriculum" heading renders with nothing beneath it. Seven of ten programmes
   show duration as "As per programme structure". Medium reads "English" despite
   the site-wide English-and-Tamil promise.
   - Never render a section whose content is empty or missing.
   - Add a build-time content validation script that fails CI when a published
     programme has an empty curriculum, an overview identical to its summary, a
     placeholder duration, or a missing medium.
   - Extend the programme type with the fields absent entirely: fees (or an
     explicit "on request"), intake dates, application deadline, assessment
     method, progression routes.
   - Populate NOTHING yourself. Generate content/TODO-programmes.md listing
     exactly which field is missing on which programme. Do not invent curriculum
     modules, entry requirements, durations or fees under any circumstances.

8. BROKEN LINKS
   - Footer social icons link to bare facebook.com / instagram.com /
     linkedin.com. Move to config; render nothing when a value is empty.
   - Careers mailto subjects are half-encoded ("subject=Application: Student%20
     Counsellor"). Run the whole subject through encodeURIComponent.
   - Add a link checker covering internal routes and external links; wire into CI.

CONSTRAINTS
- TypeScript strict, no `any`, no non-null assertions on data lookups.
- Don't restructure the visual design or rewrite copy beyond these fixes.

Finish with a summary of what changed, what still needs human-supplied content,
and anything you found that this list didn't cover.
```

---

## Claude Code — Session 2
### Forms, authentication, input hardening

Branch: `fix/forms-and-auth`

```
Read CLAUDE.md first. Session 1 (data integrity) has merged.

This site has four forms — an enquiry form duplicated on /contact and
/admissions, a short programme enquiry form, applicant registration
(/apply/register) and applicant login (/apply/login) — plus a document upload
step. The audience is Sri Lankan, so phone and name handling must be built for
that market specifically.

Explore the current implementations and show me what validation exists today
before changing anything.

1. ONE VALIDATION LAYER
   Consolidate the duplicated enquiry form into <EnquiryForm source="..." /> used
   on /contact, /admissions and programme pages, tagging submissions with their
   source for lead attribution. Define every schema once with Zod, shared
   client/server — the server re-validates independently and never trusts the
   client.

2. PHONE VALIDATION FOR SRI LANKA (highest-risk field on the site)
   Accept and normalise to E.164 (+94xxxxxxxxx):
     0771234567 / 077 123 4567 / 077-123-4567 / +94771234567 / +94 77 123 4567 /
     0094771234567 / 94771234567 / 0812201650 / padded whitespace
   CRITICAL: a "must be 10 digits" rule breaks every Kandy landline including the
   college's own, 0812201650 — 9 digits after the leading zero. Do not write it.
   Reject: too short, too long, alphabetic, fullwidth digits.
   Use libphonenumber-js with 'LK' as default region, not a hand-rolled regex.
   Show the expected format as a hint; never reject on formatting alone —
   normalise. Decide a policy for international numbers (the Gulf diaspora is a
   real applicant segment) and tell me what you chose.

3. EMAIL, NAME AND TEXT
   Email: accept plus-addressing, subdomains, mixed case (lowercase on store),
   trim whitespace; reject missing TLD, internal spaces, double @; cap at 254.
   Name — labelled "Full Name (as in NIC / Passport)" — MUST accept Tamil
   (நித்தர்சன்) and Sinhala (සමන් පෙරේරා) script, apostrophes (O'Brien), hyphens
   (Jean-Pierre) and periods (A. Fernando). Reject whitespace-only input: a check
   that only tests `!== ''` passes three spaces. Min 2 / max 100 with explicit
   messages, never silent truncation. Add a hint explaining it must match the
   certificate.
   Message field: max length with a live counter.

4. PASSWORD UX AND POLICY
   - State the policy before the user types; validate live against it.
   - Show/hide toggle on both fields with an aria-label that updates with state.
   - Strength meter (zxcvbn or similar).
   - Validate confirm inline as the user types, not only on submit.
   - Check against a common-password list.
   - Cap at 72 bytes explicitly if using bcrypt — don't let it truncate
     silently. Prefer argon2id.
   - Allow paste in both fields; blocking it breaks password managers.
   - Don't trim leading/trailing spaces from passwords.

5. PASSWORD RECOVERY — DOES NOT EXIST TODAY
   /apply/login has no "Forgot password?" link at all, on a portal explicitly
   built around saving and resuming progress. Applicants who forget have no route
   back to a part-completed application.
   Build /apply/forgot-password and /apply/reset-password with a single-use,
   60-minute, cryptographically random token stored hashed. Always return the
   same neutral message regardless of whether the account exists — and apply the
   same neutrality on registration, never revealing that an email is already
   registered. Rate limit per IP and per email. Invalidate all sessions on reset.

6. SUBMISSION STATE
   Every form: disabled + loading submit preventing double submission; a defined
   success state (confirmation, reference number, expected response time); a
   defined failure state; input retained on failure; an offline case that says
   "You appear to be offline" and keeps the data rather than hanging.
   Accessibility: aria-invalid on failed fields, aria-describedby linking inputs
   to errors, an aria-live="polite" region for form-level messages, focus moved
   to the first invalid field on submit.
   Test every form once with airplane mode on.

7. SECURITY HARDENING
   - CSRF on all mutating routes.
   - Rate limiting per IP and per email on enquiry, register, login, reset;
     Cloudflare Turnstile after N failures.
   - Escape user input everywhere it's later displayed — including admin views
     and notification emails. Test <script>alert(1)</script> and
     <img src=x onerror=alert(1)> in every field.
   - CSV FORMULA INJECTION: prefix any exported value starting with = + - @ tab
     or CR with a single quote. A name of =cmd|'/c calc'!A1 must not execute when
     an admin opens the lead export in Excel.
   - Parameterised queries only.
   - IDOR — highest severity: every portal endpoint must verify the requested
     application belongs to the authenticated user. This portal stores NIC and
     passport scans.

8. DOCUMENT UPLOAD
   - Validate by magic bytes server-side, not extension. A .exe renamed .pdf must
     be rejected.
   - Accept and convert HEIC — the iPhone camera default, will be very common.
   - Enforce the size limit client-side before upload starts, and state it.
   - Reject 0-byte files.
   - Show progress, a preview of what was stored, and allow replacement.
   - Handle a mid-upload connection drop with a clear retry, never a silent hang.
     Applicants are on mobile networks; this is where applications die.
   - Sanitise filenames; never use one as a path. Test ../../etc/passwd.
   - Handle Tamil characters in filenames.
   - Store in PRIVATE storage with signed expiring URLs. Verify by opening a
     stored document URL in a logged-out incognito window — it must fail.

Don't change the visual design beyond adding the missing affordances. Write
schema-level unit tests as you go; the full suite comes later. Report anything
this list didn't anticipate.
```

---

## Claude Code — Session 3
### Missing UI surfaces and accessibility

Branch: `fix/ui-surfaces-and-a11y`

```
Read CLAUDE.md first. Sessions 1 and 2 have merged.

Match the existing design system in everything you build: small uppercase eyebrow
label, then a large H2, then supporting body copy; card grids with image-top
layout; gold/amber accent against white and deep navy; formal but warm tone.
Mobile-first — most users are on 360px-wide Android devices.

Accessibility is a requirement, not a pass at the end: visible focus rings (never
outline-none without a replacement), 4.5:1 contrast on text, 44x44px minimum tap
targets, correct semantic elements, aria-labels on icon-only controls.

BUILD THESE SURFACES

1. Reusable empty state — used when programme filters match nothing, when there
   are no upcoming events, and when there are no vacancies. Props: icon, heading,
   body, optional action. The filter variant lists the currently active filters
   so the user understands why they see nothing, plus a "Clear all filters"
   action.

2. Branded 404 and 500 pages. 404: apology, programme search box, quick links to
   Programmes / Admissions / Apply / Contact, and the admissions number
   0812 201 650. 500: retry action plus the phone number. Both must look like the
   site, not a Next.js default.

3. Programme filter bar — Level, Study mode, School, plus text search and a sort
   control. Must render ABOVE the results grid in DOM order (it currently comes
   after, so keyboard and screen-reader users traverse all 10 cards before
   reaching the controls). Live result count, active filters as removable chips,
   "Clear all", per-option counts, zero-match options disabled rather than
   hidden. Read and write filter state to the URL query string so results are
   shareable and survive back-navigation. Fully keyboard operable.

4. Password field component — label, input, show/hide toggle with a correctly
   updating aria-label, a policy list that ticks off live, a strength meter, and
   a confirm variant validating the match inline. Wire into Session 2's forms.

5. Enquiry success screen — confirmation heading, reference number, what happens
   next and by when, admissions phone and WhatsApp as alternatives, a link on to
   Programmes. Announced via aria-live.

6. Application progress indicator — Create Account, Personal Details,
   Qualifications, Upload Documents, Review & Submit, with completed / current /
   upcoming states and a completion percentage. Must be legible at 360px; build a
   compact mobile variant rather than cramming five labels into one row.

7. Document upload UI — drag-and-drop plus file picker, with idle / dragging /
   uploading-with-progress / success-with-preview / error-with-retry states.
   Shows accepted formats and the size limit before the user picks. Fully
   keyboard operable, not drag-only.

8. Branch finder page — the site claims 22 branches island-wide but renders them
   as a run-on string of town names with no addresses. Build a searchable list
   with a map, each card showing name, address, phone, hours and directions.
   Structure it for real data; use clearly marked placeholders and do NOT invent
   addresses or phone numbers.

9. Accreditation section redesign — currently eight bare logos with no
   explanation. Each partner (CPD, Universidad Azteca, IAU, UNESCO, UGC, IBDF and
   others) gets its logo, a one-line description of what the relationship
   actually is, and a link to verifiable detail. This is the most important trust
   signal on the site for a Sri Lankan audience. Leave descriptions as
   TODO(content) — do NOT write accreditation claims yourself.

THEN FIX THE CONFIRMED ACCESSIBILITY DEFECTS

- Programme card images have descriptive-sounding alt text (alt="BSc Information
  Technology") on stock photos that show something else. They're decorative and
  the heading follows immediately — use alt="".
- /admissions appears to have no H1. Verify and fix; exactly one H1 per page.
- Testimonials contain a literal " glyph as visible content inside the
  blockquote. Move decorative quote marks to CSS pseudo-elements.
- Feature lists use literal ✓ characters, announced as "check mark" before every
  item. aria-hidden them or move to CSS.
- The /admissions steps render as "1. 01 Discover" — an ordered list plus visible
  numerals. aria-hidden the visual numbers.
- The floating WhatsApp button renders as a bare URL, suggesting no link text and
  no aria-label. Give it an accessible name.
- Verify the mobile menu: opens by keyboard, traps focus while open, closes on
  Escape.
- Check colour contrast on the gold/amber accent against both white and navy —
  brand golds routinely fail 4.5:1 for body text. Check button labels, eyebrow
  text and stat captions specifically.
- Confirm lang="en" on <html>; mark any Tamil blocks lang="ta".
- Add prefers-reduced-motion handling for scroll/fade animations.
- Verify the layout reflows at 200% and 400% zoom without horizontal scrolling.

Report which contrast pairs failed and what you changed them to.
```

---

## Claude Code — Session 4
### Performance, SEO, structured data, headers

Branch: `fix/performance-and-seo`

```
Read CLAUDE.md first. Sessions 1–3 have merged.

Audience is mid-range Android on 4G in Sri Lanka. Optimise for that, not desktop
fibre.

Start by measuring. Run a production build; report First Load JS per route,
the largest client bundles, and every image the homepage and /programmes request
with its dimensions and origin. Show me that baseline before changing anything so
we can measure the delta.

1. IMAGE PIPELINE
   Current: 13+ homepage images, most from images.unsplash.com at w=1200&q=80 —
   roughly 3x oversized for a 360px viewport, on a third-party origin costing an
   extra DNS + TCP + TLS round trip before first byte. Eight partner logos are
   PNGs. /images/hero-image.jpg is loaded twice on the homepage.
   - Migrate every <img> to next/image with an accurate `sizes` prop. A missing
     or wrong `sizes` on a `fill` image is worse than not using next/image.
   - Enable AVIF: images.formats = ['image/avif', 'image/webp'].
   - Move all imagery off images.unsplash.com to /public or Vercel Blob. Leave
     clearly-marked placeholders where the college must supply real photography;
     don't silently substitute other stock images.
   - Convert the eight partner logos to SVG, or WebP if no vector source exists.
   - priority + fetchPriority="high" on the LCP hero ONLY; everything else lazy.
   - Blur placeholders.
   - Explicit dimensions or aspect-ratio on every image container to eliminate CLS.
   - De-duplicate the hero image usage.

2. RENDERING AND BUNDLE
   - Audit every 'use client'. /programmes, /apply/register and /apply/login
     appear fully client-rendered — which is why /programmes currently exports NO
     metadata at all (no description, no canonical, no Open Graph). A client
     component cannot export metadata.
   - Convert each to a server component page exporting metadata, rendering a
     small client island for the interactive part.
   - Add per-page metadata to /programmes, /apply, /apply/register,
     /apply/login; set robots: { index: false } on the two auth pages.
   - Self-host and subset fonts with next/font, display: swap. If Tamil is added
     later, subset separately — Tamil webfonts are large.
   - Show me the weight saving before removing anything, but consider cutting
     homepage sections: the hybrid-model message repeats three times and the
     5-step journey block is duplicated verbatim on /admissions.

3. STRUCTURED DATA (none exists today)
   - EducationalOrganization on the homepage: name, address (Kandy, Sri Lanka,
     208000), telephone +94812201650, email, logo, and sameAs only once real
     social URLs exist — omit the key rather than linking bare facebook.com.
   - Course on each programme page: name, description, provider,
     hasCourseInstance with courseMode and duration.
   - Event on each event page: name, startDate WITH the +05:30 offset, location,
     organizer, eventAttendanceMode.
   - NewsArticle on news items — and fix og:type, currently "website" on every
     page including articles.
   - JobPosting on careers entries; this feeds Google Jobs directly.
   - BreadcrumbList sitewide, with visible breadcrumbs on programme and news pages.
   Validate against the Rich Results Test and report the output.

4. CRAWLABILITY
   - Generate app/robots.ts and app/sitemap.ts, the sitemap built from programme,
     news and event data so it never goes stale. Exclude /apply/login and
     /apply/register.
   - /events appears in neither the main nav nor the footer — reachable only from
     one homepage link, while the nav item "News & Events" goes to /news. Add
     Events to both, or merge into a tabbed route.
   - Prepare a 301 redirect map for the move from nextway-college.vercel.app to a
     real .lk domain, and flag the move to me as a business decision with a
     recommendation. A .vercel.app domain carries no institutional credibility
     and some corporate networks block it.

5. SECURITY HEADERS
   Content-Security-Policy (start report-only), Strict-Transport-Security with
   preload, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Tell me
   the expected securityheaders.com grade.

6. MONITORING AND BUDGETS
   - Add @vercel/speed-insights and @vercel/analytics.
   - Add Sentry with source maps.
   - Add a Lighthouse CI GitHub Action configured for a mid-range Android on
     Slow 4G — not desktop — failing the build on regression:
       LCP < 2.5s   INP < 200ms   CLS < 0.1   TTFB < 800ms
       First Load JS < 130KB/route   Homepage total < 1.5MB
       Performance >= 85   Accessibility >= 95   SEO = 100

Finish by re-running the baseline and showing me a before/after table.
```

---

## GitHub Copilot — Prompt 1
### The regression suite

Use Copilot agent mode. Start this after Session 2 merges; it can run alongside
Sessions 3 and 4.

```
Set up Vitest for unit tests and Playwright for E2E in this Next.js repo, with a
CI workflow running both on every PR. Then implement the suites below.

Where a case fails against current source, DO NOT fix the source and DO NOT
adjust the assertion to pass — report the failure to me.

SUITE 1 — PHONE NORMALISATION (unit)
Accept and normalise to +94...: 0771234567, "077 123 4567", 077-123-4567,
+94771234567, "+94 77 123 4567", 0094771234567, 94771234567, 0812201650,
"  0771234567  ".
Reject: 077123456, 07712345678901, abcdefghij, empty, "   ".
REGRESSION GUARD: 0812201650 is the college's own Kandy landline — 9 digits after
the leading zero. Any "must be 10 digits" rule breaks it. Assert this case
explicitly with a comment explaining why it exists.

SUITE 2 — EMAIL (unit)
Accept: user@example.com, user+tag@gmail.com, user.name@sub.domain.lk,
"USER@EXAMPLE.COM" (lowercased on store), whitespace-padded input.
Reject: user@example, "user @example.com", user@@example.com, 320 chars.
Assert an already-registered email returns the SAME neutral message as an
unregistered one — account-enumeration guard.

SUITE 3 — NAME FIELD (unit)
Accept: "Nimal Perera", "A. Fernando", "O'Brien", "Jean-Pierre", "நித்தர்சன்"
(Tamil), "සමන් පෙරේරා" (Sinhala). The Tamil and Sinhala cases are not optional —
the college advertises Tamil-medium delivery.
Reject: 1 character, 500 characters, "   " (assert a bare `!== ''` check does not
pass this), "😀😀".
Assert <script>alert(1)</script> is stored escaped and rendered as literal text.

SUITE 4 — PASSWORD (unit)
Reject "123456", "password", 7 characters, a password containing the user's
email. Accept a strong password and a 200-char one (capped, not silently
truncated). Assert leading/trailing spaces are NOT trimmed, mismatched confirm
gives an inline error, and paste is not blocked.

SUITE 5 — SECURITY (integration, staging only)
- XSS: <script>alert(document.cookie)</script> and <img src=x onerror=alert(1)>
  in every text field — assert escaped output everywhere displayed, including
  admin views and notification email bodies.
- SQLi: ' OR '1'='1 in the email field must not bypass auth.
- CSV formula injection: submit a name of =cmd|'/c calc'!A1, export leads, assert
  the value is quote-prefixed. Cover = + - @ tab CR.
- Path traversal: upload a file named ../../etc/passwd; assert the filename is
  sanitised and never used as a path.
- Rate limiting: 100 rapid submissions from one IP — assert throttling.
- CSRF: forged/missing token on register is rejected.
- IDOR, HIGHEST SEVERITY: authenticate as applicant A, request applicant B's
  application ID on every portal endpoint, assert 403 on each. This portal stores
  NIC and passport scans.
- GET /apply/dashboard logged out redirects and leaks no data in the body.
- Fetch a stored document URL with no session — assert it fails.

SUITE 6 — FILE UPLOAD (integration)
2MB PDF accepted with preview. 50MB rejected client-side before upload starts.
0-byte rejected. .exe renamed .pdf rejected by magic-byte check. .heic accepted
and converted (iPhone default, will be very common). Sixth file rejected when the
limit is five. Same file twice replaces rather than duplicates. Tamil characters
in a filename handled. Connection drop at 70% gives a clear retry, not a hang.

SUITE 7 — E2E (Playwright)
- Filter /programmes by School of Computing & IT: assert BSc Information
  Technology appears. This filter previously returned zero for every school
  because the data field was unpopulated — the regression most likely to recur.
- A filter combination with no matches renders the empty state with a working
  "Clear all filters".
- Apply filters, open a programme, press Back: filters preserved (URL state).
- Happy path: homepage -> programme -> Apply -> register, asserting the programme
  name persists all the way through. The ?programme= param was previously dropped.
- /apply?programme=nonexistent-slug: graceful fallback, no crash.
- /apply?programme=<script>alert(1)</script>: escaped, no execution.
- Submit an enquiry, press Back: no resubmission prompt.
- Double-click Submit: exactly one submission.
- Submit offline: offline message shown, entered data retained.
- Session expiry mid-application: re-auth prompt, NO data loss.
- Register in one browser context, resume in another: progress restored.
- Full password reset flow end to end.
- GET /programmes/nonexistent-slug: branded 404, not a crash.

SUITE 8 — DATE AND TIMEZONE (unit)
Run every case under TZ=UTC, TZ=Asia/Colombo and TZ=America/New_York, asserting
identical output in all three.
- An event stored as 2026-09-12T09:00:00+05:30 renders "9:00 AM", never "3:30 AM".
  The live site currently shows 3:30 AM for a Kandy campus open day.
- A past-dated event does not appear under "Upcoming" on either the homepage or
  /events. These two surfaces previously disagreed.
- No React hydration mismatch on any date-rendering component.

SUITE 9 — ACCESSIBILITY (Playwright + axe-core)
Run axe on every route, failing on serious/critical. Additionally assert: exactly
one H1 per page (/admissions may currently have none); all inputs have associated
labels; errors are linked by aria-describedby and announced via aria-live;
visible focus on every interactive element; the mobile menu opens by keyboard,
traps focus, and closes on Escape; the floating WhatsApp button has an accessible
name; decorative ✓ and " glyphs are aria-hidden; the /admissions ordered list
does not double-announce as "1. 01 Discover"; layout reflows at 400% zoom without
horizontal scrolling.

CI: unit tests on every push; E2E and axe on every PR; block merge on failure.
Coverage threshold 80% on validation and data-selector modules.
```

---

## GitHub Copilot — Prompt 2
### PR review, per session

Paste as a comment on each PR, or ask Copilot Chat in the PR view. Swap the
focus list per session.

```
Review this PR against .github/copilot-instructions.md, and specifically check:

[Session 1] Is metadataBase resolved from an env var with no localhost fallback
reachable in production? Does every date path go through the shared Asia/Colombo
formatter — grep for stray toLocaleDateString and Intl.DateTimeFormat calls. Are
upcoming/past event rules identical on the homepage and /events? Is the
?programme= slug validated against the catalogue before being rendered? Has any
curriculum, fee, entry-requirement or accreditation text been invented rather
than left as TODO(content)?

[Session 2] Does any phone rule assume 10 digits? Does any name validation use a
Latin-only character class? Does any required check test only `!== ''`? Is server
validation independent of the client schema, or does it trust client output? Does
the reset-password endpoint return an identical response for existing and
non-existent accounts? Is every portal query scoped to the authenticated user's
ID? Does the CSV export neutralise leading = + - @?

[Session 3] Does the filter bar precede the results grid in DOM order, not just
visually? Is filter state in the URL? Any outline-none without a focus
replacement? Any icon-only control without an accessible name? Any tap target
under 44x44px? Has any branch address, phone number or accreditation claim been
invented?

[Session 4] Any next/image with `fill` and no `sizes`? Is `priority` on more than
one image? Any 'use client' left at page level, killing that page's metadata? Do
all Event JSON-LD startDates carry the +05:30 offset? Does the sitemap generate
from data rather than a hardcoded list?

Flag anything that would regress a case in the Playwright suite.
```

---

## What neither tool can do for you

**Measure real performance.** No coding agent gives you Core Web Vitals from a
real device on a real Sri Lankan network. Run PageSpeed Insights and WebPageTest
with location set to Colombo, connection Slow 4G, device a mid-range Android.
Then read Vercel Speed Insights field data after two weeks of traffic.

**Load testing.** Model the real worst case with k6: intake deadline day, several
hundred concurrent applicants, many uploading documents at once. Watch
connection-pool exhaustion and upload timeouts, not p50 latency.

**Content.** Curriculum modules, entry requirements, durations, fees,
accreditation relationships, the 22 branch addresses, real testimonials and
photography all have to come from the college. Every prompt above deliberately
refuses to generate them. An empty Curriculum heading is embarrassing; an
invented one published under a law degree is a liability.

**Legal review.** The portal collects NIC numbers, passport scans and academic
transcripts, so Sri Lanka's Personal Data Protection Act No. 9 of 2022 applies.
Have a lawyer review the privacy policy and terms — an AI-drafted policy that
doesn't match your actual retention and sharing practices is worse than none.

**Business decisions.** Whether to keep two competing conversion paths (enquiry
form vs. account-based application); whether to keep advertising Business and
Hospitality schools with no programmes in them; whether careers@ on a real domain
is worth leaving Gmail; and when to move off .vercel.app.
```
