# Design system

Everything visual comes from the tokens and primitives below. Don't hand-write a new card, button or heading style in a page — extend one of these.

## Tokens (`src/styles/globals.css`)

| Group | Tokens |
|---|---|
| Colour | `navy` `deep-blue` `brand-red` `brand-red-dark` `gold` `gold-text` (gold for small text on light) `champagne` `ice` `pearl` `slate` `charcoal` `success` `error` |
| Type | `--font-heading` (Georgia serif), `--font-body` (system UI). No web fonts: zero font requests. |
| Radius / shadow | `--radius-card` 16px, `--radius-button` pill, `--shadow-soft` / `-premium` / `-card-hover` |
| Layout | `--max-content` 1240px, `--section-gap` (fluid 4-6rem), `--header-height` 96px, `.container-nwc` |

**Type scale** (utilities): `text-display` (hero h1), `text-section` (h2), `text-lead` (intro paragraph), `text-subtle` (secondary body), `.eyebrow` (small caps label). Body is 1.0625rem.

**Spacing scale**: Tailwind's 4px scale; section rhythm is always `.section-padding`; card padding is `Card`'s `sm` / `md` / `lg`.

## Components (`src/components/ui`)

| Component | Use for |
|---|---|
| `Button` | Every action. Variants: `primary` (the one main action per view) `secondary` `outline` `outline-light` `gold` `ghost`. Hover scale/shadow is built in. |
| `Card` | Any surface. `variant`: `panel` (tinted, default) `elevated` (`.premium-card`, hover lift) `outline`. `padding`: `none` `sm` `md` `lg`. |
| `Badge` | Status/labels. |
| `SectionHeader`, `PageHero`, `Breadcrumbs` | Page and section headings. Exactly one `h1` per page (`PageHero`, or the programme/hero title). |
| `EmptyState` | "Nothing here yet" states; always give the visitor a next step. |
| `ProgrammeCard`, `StatStrip`, `LeadForm` | Domain components; compose the primitives above. |

## Rules

1. One primary call to action per screen region. The header's "Apply Online" is the site-wide primary; don't add a second competing one.
2. Never render a placeholder token: content only the college can supply is a `{{NEEDS CLIENT INPUT: …}}` value passed through `clientValue()` (`src/lib/client-input.ts`).
3. Motion: see `src/components/motion`. Everything respects `prefers-reduced-motion`, and content must be visible without JavaScript.
4. Any value that reaches a page from the URL is validated against a fixed list first (`src/lib/programmes.ts` is the pattern).
