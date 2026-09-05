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
