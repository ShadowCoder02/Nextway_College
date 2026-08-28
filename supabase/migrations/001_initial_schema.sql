-- Next Way College International — initial schema
-- Run via Supabase SQL editor or: supabase db push

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  created_at timestamptz not null default now()
);

-- Schools
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Programmes
create table if not exists public.programmes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete set null,
  title text not null,
  slug text not null unique,
  level text not null,
  duration text,
  credits text,
  mode text,
  medium text default 'English',
  intake text,
  location text,
  overview text,
  why_this_programme text,
  learning_outcomes jsonb default '[]',
  entry_requirements jsonb default '[]',
  assessment text,
  career_opportunities jsonb default '[]',
  progression text,
  faqs jsonb default '[]',
  image_url text,
  short_pitch text,
  featured boolean default false,
  flagship boolean default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programme_modules (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  year_or_stage text not null,
  code text,
  title text not null,
  credits int,
  description text,
  sort_order int not null default 0
);

create table if not exists public.programme_fees (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  intake text not null,
  registration_fee text,
  course_fee text,
  instalment_note text,
  currency text default 'LKR',
  is_current boolean default true
);

create table if not exists public.programme_partners (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  partner_name text not null,
  partner_type text,
  logo_url text,
  description text,
  verified boolean default false
);

-- News & events
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  published_at date,
  category text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  image_url text,
  registration_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  programme text,
  quote text not null,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  consent_confirmed boolean default false,
  created_at timestamptz not null default now()
);

-- Enquiries (public insert)
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  programme_id text,
  programme_title text,
  qualification text,
  intake text,
  message text,
  source text default 'website',
  status text not null default 'new' check (status in ('new', 'contacted', 'follow_up', 'converted', 'closed')),
  consent boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.programmes enable row level security;
alter table public.programme_modules enable row level security;
alter table public.programme_fees enable row level security;
alter table public.programme_partners enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.testimonials enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;

-- Public read published content
create policy "Public read active schools" on public.schools for select using (is_active = true);
create policy "Public read published programmes" on public.programmes for select using (status = 'published');
create policy "Public read programme modules" on public.programme_modules for select using (true);
create policy "Public read programme fees" on public.programme_fees for select using (true);
create policy "Public read programme partners" on public.programme_partners for select using (verified = true);
create policy "Public read published news" on public.news for select using (status = 'published');
create policy "Public read published events" on public.events for select using (status = 'published');
create policy "Public read published testimonials" on public.testimonials for select using (status = 'published' and consent_confirmed = true);

-- Public insert enquiries only
create policy "Public insert enquiries" on public.enquiries for insert with check (true);

-- Staff read/write (authenticated users with profile)
create policy "Staff read enquiries" on public.enquiries for select using (
  exists (select 1 from public.profiles where id = auth.uid())
);
create policy "Staff update enquiries" on public.enquiries for update using (
  exists (select 1 from public.profiles where id = auth.uid())
);

create policy "Staff manage programmes" on public.programmes for all using (
  exists (select 1 from public.profiles where id = auth.uid())
);

create policy "Staff manage news" on public.news for all using (
  exists (select 1 from public.profiles where id = auth.uid())
);

create policy "Staff read own profile" on public.profiles for select using (auth.uid() = id);

-- Indexes
create index if not exists idx_programmes_slug on public.programmes(slug);
create index if not exists idx_programmes_status on public.programmes(status);
create index if not exists idx_enquiries_created on public.enquiries(created_at desc);
create index if not exists idx_news_slug on public.news(slug);
create index if not exists idx_events_slug on public.events(slug);
