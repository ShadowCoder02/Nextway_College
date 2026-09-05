# Programme content the college must supply

Generated from `npm run validate-content` (`scripts/validate-programme-content.ts`),
which fails the build when a published programme regresses on the first three
checks below. Nothing here has been invented — every checkbox is a field left
genuinely empty, a placeholder string, or duplicated text found as-is in
`data/cms/programmes.json`.

## Every one of the 10 published programmes needs

- [ ] **Curriculum** — `modules: []` on all 10. The Curriculum section is
  currently hidden rather than showing an empty heading, but no programme has
  a real module list yet, including the BSc IT flagship.
- [ ] **A distinct Overview** — `overview` is byte-identical to `shortPitch`
  (and, since no `seoDescription` is set, to the meta description too) on all
  10 programmes. Needs its own paragraph distinct from the one-line pitch.
- [ ] **Fees** — no programme has a `fees` object. The page now shows
  "Available on request — contact Admissions" instead of a blank/missing
  section; replace with real registration/course fee figures per programme
  once available.
- [ ] **Application deadline** — `applicationDeadline` is a new optional field
  (added this session) and is unset everywhere. The page shows "To be
  announced — contact Admissions" until it's populated.

## Placeholder duration ("As per programme structure") — 7 of 10

- [ ] BA Geography (SP) — `ba-geography-sp`
- [ ] BA Political Science (SP) — `ba-political-science-sp`
- [ ] HND in Primary Education — `hnd-primary-education`
- [ ] HND in English — `hnd-english`
- [ ] BA Tamil (SP) — `ba-tamil-sp`
- [ ] HND in Law — `hnd-law`
- [ ] Diploma in Preschool — `diploma-preschool`

(BSc Information Technology, LLB Bachelors of Law and Law College Entrance
Exam Training already have real duration values.)

## Needs confirmation, not a missing field

- [ ] **Medium says "English" only** on BSc Information Technology
  (`bsc-information-technology`) and HND in English (`hnd-english`), while the
  site-wide copy (`src/constants/site.ts`) promises "English and Tamil medium
  classes." Confirm whether these two programmes are genuinely English-only
  or should be "English & Tamil" like the other 8.
- [ ] **School taxonomy** — see the TODO(content) note already in
  `src/data/content.ts` above the Law/Education/Social Sciences schools added
  this session; the college hasn't formally confirmed this 7-school structure.

## Not modified this session (do not assume these are fine)

`assessment` and `progression` are populated on every programme, but with the
same boilerplate sentence repeated verbatim across all 10 — worth reviewing
for accuracy per programme, even though the validator doesn't flag it (it
isn't "empty").
