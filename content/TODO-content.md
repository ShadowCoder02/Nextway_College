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

Note: `check-images.ts` also found `data/cms/news.json`'s
`applications-open-2026-intake` article image returning 404. That's outside
Session 1's scope (programme images only) — flagged for whoever picks up news
content next.

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
