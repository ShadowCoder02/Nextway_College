# Content the college must supply

Items flagged during development that must never be invented by an engineer
or an AI tool. Each entry names the exact file/field to update once the real
material is available.

## Programme photography (Session 1, fix #2)

`scripts/check-images.ts` found 6 of 10 programme images returning 404 from
Unsplash (fabricated/dead photo IDs). They now point at a temporary local
placeholder — a reused campus photo, not programme-specific — at
`/public/images/programmes/<slug>.jpg`. Replace the file for each slug below
with real photography once available; no data file changes are needed since
`data/cms/programmes.json` already points at these paths.

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
