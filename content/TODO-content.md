# Content the college must supply

Items flagged during development that must never be invented by an engineer
or an AI tool. Each entry names the exact file/field to update once the real
material is available.

## Programme photography (Session 1, fix #2; consolidated in Session 4)

`scripts/check-images.ts` found 6 of 10 programme images returning 404 from
Unsplash (fabricated/dead photo IDs). Session 1 pointed all 6 at individual
copies of the same reused campus photo, one file per slug. Session 4's
performance pass found those 6 files were byte-for-byte identical — six
separate downloads of the same image — and consolidated them to a single
shared file, `/public/images/programmes/placeholder.jpg`, so the browser
fetches it once. All 6 slugs below currently point at that one shared path
in `data/cms/programmes.json`.

When real photography arrives for a slug, save it at that slug's target path
below **and** update that programme's `imageUrl` in `data/cms/programmes.json`
to point at the new file (a data change is needed this time, since they no
longer default to per-slug filenames):

- [ ] `public/images/programmes/ba-political-science-sp.jpg` — BA Political Science (SP)
- [ ] `public/images/programmes/hnd-english.jpg` — HND in English
- [ ] `public/images/programmes/ba-tamil-sp.jpg` — BA Tamil (SP)
- [ ] `public/images/programmes/hnd-law.jpg` — HND in Law
- [ ] `public/images/programmes/diploma-preschool.jpg` — Diploma in Preschool
- [ ] `public/images/programmes/law-college-entrance-exam-training.jpg` — Law College Entrance Exam Training

`check-images.ts` also found `data/cms/news.json`'s
`applications-open-2026-intake` article image returning 404 (outside Session
1's scope at the time). Session 4 pointed it at the same local campus
placeholder used elsewhere, since `check-images` is now a blocking CI check
(`.github/workflows/ci.yml`) and a known-dead URL would fail every PR.

- [ ] `data/cms/news.json`'s `applications-open-2026-intake` article —
      replace `/images/nextway-college.jpg` with a real photo for this
      article once available.

## Campus showcase second image (Session 4, performance baseline)

`src/components/marketing/CampusShowcase.tsx` rendered a second homepage tile
with `alt="Students at Nextway College International"`, but its source,
`/public/images/nextway.png`, is byte-identical (md5) to `/public/brand/
logo.png` — it's the college's logo graphic, not a student photograph. That's
a content-accuracy bug, not a performance one: real learners would have seen
the logo mislabeled as a photo of themselves. Removed the tile rather than
fabricate or substitute a stock replacement.

- [ ] Supply a real campus/student photo for this homepage tile (a second
      image beside the existing full-bleed campus photo, in the same
      section). Until then the section shows only the "Hybrid excellence"
      text panel.

## Homepage stock photo reuse (Session 4, performance baseline)

Not a bug to fix — flagging for the college. The same Unsplash BSc IT stock
photo appears twice in one homepage scroll (the featured-programmes grid and
the flagship spotlight section immediately below it), and `/images/hero-
image.jpg` also appears twice (the top hero and the campus showcase). No
extra bytes are downloaded (same cached URL each time), but a visitor sees
the same two stock images repeated. Real photography for the BSc IT
programme and additional campus shots would resolve this — not something to
paper over with a different stock substitute.

## Branch count headline (this session's gap-audit)

`src/components/marketing/HybridSections.tsx`'s `BranchesSection` (shown on
Home and About) had a section headline reading "22 branches across Sri
Lanka" — a specific, checkable number stated as fact right next to a "Find
your nearest branch" button that leads to a page admitting 15 of those 22
aren't even named, and the other 7 have no confirmed address/phone/hours at
all. Reworded to "Branches across Sri Lanka" (no unverified count) and the
description now lists only the 7 confirmed town names.

- [ ] Once the college confirms a real branch count, restore it to the
      headline and to the remaining two places still stating it:
      - `SITE.description` (`src/constants/site.ts`) — used verbatim in
        meta descriptions, JSON-LD and the About page hero.
      - Every programme's `location` field defaults to the literal string
        `"All island — 22 branches"` (`src/data/programmes-seed.ts`, and
        already-seeded records in `data/cms/programmes.json`) — this is
        editable per-programme via the admin programme editor already, so
        fixing it is a content/data correction there, not a code change.
      The `src/data/content.ts` "Island-wide access" why-us card was
      reworded here to name only the 7 confirmed towns, matching the
      headline fix, since it's shared marketing copy rather than
      per-programme data.

## Branch directory (Session 3, "branch finder" surface)

`SITE.description` and marketing copy (`src/components/marketing/
HybridSections.tsx`, `src/app/(site)/about/page.tsx`) claim "22 branches
island-wide," but only 7 town names have ever existed anywhere in the
codebase, with no addresses, phone numbers or hours for any of them. Built
`/branches` (`src/data/branches.ts`, `src/components/branches/BranchFinder.tsx`)
structured for this data, rendering "To be confirmed" placeholders and a
"map coming soon" notice rather than inventing any of it.

- [ ] Confirm whether the college genuinely operates 22 branches, and supply
      the other 15 branch names.
- [ ] Supply address, phone number and operating hours for all confirmed
      branches (add to `src/data/branches.ts`).
- [ ] Once addresses exist, the branch finder's map placeholder can be
      replaced with a real embed/plot.

## Master remediation pass — items needing client input

Every placeholder is a `{{NEEDS CLIENT INPUT: …}}` token in source/data
(`grep -rn "NEEDS CLIENT INPUT" src content`). Tokens never render publicly —
`src/lib/client-input.ts` strips them and shows a neutral fallback or nothing.

- [ ] **Partner / accreditation logos** (`src/constants/approvals.ts`): a logo
      alone implies an endorsement, so partners WITHOUT a real, specific
      description are now hidden (the whole "Accreditations & Affiliations"
      section disappears from Home and About until at least one is supplied).
      Per partner: description of the relationship + a verify URL. To show
      logos anyway (not recommended) set `SHOW_UNVERIFIED_APPROVALS = true`.
- [ ] **Unsubstantiated accreditation wording in copy** — confirm or reword:
      `src/data/content.ts` ("Accredited partnerships" card), `src/app/(site)/about/page.tsx`
      ("accredited partnerships"), `src/app/(site)/apply/page.tsx`
      ("internationally recognised qualification"), and the default heading
      text in `src/components/marketing/ApprovalsStrip.tsx`.
- [ ] **Social profiles** (`SITE.social` in `src/constants/site.ts`): real
      Facebook / Instagram / LinkedIn URLs. Until then the footer shows none
      and JSON-LD `sameAs` is omitted.
- [ ] **Testimonials** (`src/data/content.ts`): confirm all three are genuine
      and consented; supply full first name, graduation year/intake and — with
      written consent — a real photo for each. Photos only render when
      `photoConsentConfirmed` is true.
- [ ] **Programme facts** (per programme, editable in the admin programme
      editor): awarding institution, recognition/accreditation status, actual
      duration (many still say the generic "As per programme structure"),
      published fees (or confirm "on request"), next intake date. Missing
      facts render as "Not yet confirmed — ask Admissions".
- [ ] **Programme entry requirements** are generic boilerplate for most
      programmes ("as approved by the College") — supply the real ones.

- [ ] **Programme page content is largely boilerplate.** "Learning outcomes"
      and "Why this programme" are the shared placeholder text for most
      programmes (now hidden rather than repeated on every page), entry
      requirements are identical generic wording, and `overview` equals the
      short pitch. For each programme supply genuinely distinct overview,
      outcomes, entry requirements, career paths and FAQs — thin duplicate
      pages rank poorly and give applicants nothing to decide with.
- [ ] **"22 branches" claim** appears in: `src/constants/site.ts`
      (`SITE.description`), `src/data/content.ts` (why-us card),
      `src/components/marketing/HybridSections.tsx` (heading),
      `src/app/(site)/about/page.tsx`, `src/app/(site)/apply/page.tsx`,
      `src/data/programmes-seed.ts` + admin editor default (`location`).
      It is deliberately NOT in the homepage trust strip until verified.
- [ ] **Hero photography:** the homepage hero is a dimmed stock-style campus
      photo. Authentic photography of real students/campus would replace it
      (`public/images/hero-backdrop.jpg` is derived from `hero-image.jpg`).

### Repeated imagery (client to supply distinct photography)

- Home: `hero-image.jpg` ×3 (hero backdrop, one programme card, campus
  showcase); `nextway-college.jpg` ×4 (cards + fallback tiles).
- `/programmes`: `nextway-college.jpg` ×5, `hero-image.jpg` ×2, and the
  college **logo graphic (`nextway.png`) ×3 shown as a programme "photo"**
  (now swapped for the campus placeholder at render time by
  `photoOrPlaceholder`, but the seed data should get real photos).
- 6 programmes share `/images/programmes/placeholder.jpg`
  (see "Programme photography" above).

## Accreditation partner descriptions (Session 3, accreditation redesign)

`src/constants/approvals.ts` — all 8 partner logos (CPD, Universidad Azteca,
IAU, UNESCO, UGC, IBDF, Accreditation Partner, Future Focus Welfare Team) show
a neutral "Partnership details to be confirmed" placeholder rather than an
invented relationship claim. For each:

- [ ] Confirm and write a one-line description of what the relationship
      actually is (member, accredited by, affiliate, sponsor, etc.).
- [ ] Supply a `verifyUrl` linking to verifiable detail (the partner's own
      accreditation/member listing page) — omitted entirely today, matching
      the pattern used for the footer's empty social links.
