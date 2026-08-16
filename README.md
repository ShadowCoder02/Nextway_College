# Next Way College International — Website

Premium institutional website built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── app/              # Next.js App Router
│   ├── (site)/       # Public pages (with navbar/footer)
│   ├── admin/        # Staff dashboard (protected)
│   └── api/          # API routes (enquiries)
├── components/       # UI, layout, programme, admin
├── constants/        # Site config, nav links
├── data/             # Static content (programmes, news, etc.)
├── lib/              # Supabase, SEO, validation, utils
├── services/         # Data access layer
├── styles/           # Design tokens, typography, globals
└── types/            # TypeScript interfaces

supabase/
├── migrations/       # Database schema + RLS
└── seed/             # Sample data (optional)
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SITE_URL` — your production domain (e.g. `https://nextwaycollege.lk`)
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key (never use service role in frontend)

**Without Supabase:** the site runs fully with static content from `src/data/content.ts`. Enquiry forms succeed locally but are not persisted.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Create a staff user via Authentication → Users
4. Insert a profile row linking the user UUID to `profiles` table
5. Add URL and anon key to `.env.local`

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy — connect your domain in Vercel DNS settings

See `docs/deployment.md` for full checklist.

## Content updates

Until CMS is built, edit programme/news content in:

- `src/data/content.ts` — programmes, schools, news, events, testimonials
- `src/constants/site.ts` — contact details, social links, tagline

See `docs/content-checklist.md` for what you need to supply before go-live.

## Admin

Staff login: `/admin/login` (requires Supabase Auth + profile)

Dashboard shows enquiries and content stats.

## License

Private — Next Way College International.
# Nextway_College
