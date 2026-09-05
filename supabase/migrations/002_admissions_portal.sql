-- Next Way College International — Admissions & Application Portal Schema Migration
-- Run via Supabase SQL editor or: supabase db push

-- 1. Applicants Table
create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  phone text not null,
  password_hash text not null,
  password_salt text not null,
  is_verified boolean not null default false,
  verification_token text,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Student Applications Table
create table if not exists public.student_applications (
  id uuid primary key default gen_random_uuid(),
  application_number text not null unique,
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  status text not null default 'DRAFT' check (
    status in (
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'DOCUMENTS_REQUIRED',
      'DOCUMENTS_VERIFICATION',
      'INTERVIEW_REQUIRED',
      'INTERVIEW_SCHEDULED',
      'APPROVED',
      'REJECTED',
      'WAITLISTED',
      'WITHDRAWN',
      'ENROLLED'
    )
  ),
  current_step int not null default 1,
  personal_info jsonb not null default '{}'::jsonb,
  qualifications jsonb not null default '[]'::jsonb,
  programme_choice jsonb not null default '{}'::jsonb,
  interview jsonb,
  requested_documents_notes text,
  declaration_confirmed boolean not null default false,
  declaration_timestamp timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Application Documents Table
create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.student_applications(id) on delete cascade,
  category text not null check (
    category in (
      'nic_passport',
      'academic_ol',
      'academic_al',
      'higher_education',
      'birth_certificate',
      'photograph',
      'other'
    )
  ),
  title text not null,
  original_filename text not null,
  stored_filename text not null,
  file_size bigint not null,
  mime_type text not null,
  file_path text not null,
  verification_status text not null default 'pending' check (
    verification_status in ('pending', 'verified', 'rejected')
  ),
  rejection_reason text,
  uploaded_at timestamptz not null default now()
);

-- 4. Application Timeline / Audit Trail Table
create table if not exists public.application_timeline (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.student_applications(id) on delete cascade,
  actor text not null,
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

-- 5. Application Internal Notes Table
create table if not exists public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.student_applications(id) on delete cascade,
  author_name text not null,
  note text not null,
  is_internal boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.applicants enable row level security;
alter table public.student_applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_timeline enable row level security;
alter table public.application_notes enable row level security;

-- Policies for Applicants (Own data access)
create policy "Applicants view own profile" on public.applicants
  for select using (auth.uid() = id);

create policy "Applicants update own profile" on public.applicants
  for update using (auth.uid() = id);

create policy "Applicants manage own applications" on public.student_applications
  for all using (
    exists (select 1 from public.applicants where id = student_applications.applicant_id and id = auth.uid())
  );

create policy "Applicants manage own documents" on public.application_documents
  for all using (
    exists (
      select 1 from public.student_applications sa
      where sa.id = application_documents.application_id and sa.applicant_id = auth.uid()
    )
  );

-- Policies for Staff / Admin
create policy "Staff view all applicants" on public.applicants
  for select using (exists (select 1 from public.profiles where id = auth.uid()));

create policy "Staff manage all applications" on public.student_applications
  for all using (exists (select 1 from public.profiles where id = auth.uid()));

create policy "Staff manage all documents" on public.application_documents
  for all using (exists (select 1 from public.profiles where id = auth.uid()));

create policy "Staff manage timeline" on public.application_timeline
  for all using (exists (select 1 from public.profiles where id = auth.uid()));

create policy "Staff manage notes" on public.application_notes
  for all using (exists (select 1 from public.profiles where id = auth.uid()));

-- Indexes for performance
create index if not exists idx_student_apps_applicant on public.student_applications(applicant_id);
create index if not exists idx_student_apps_status on public.student_applications(status);
create index if not exists idx_student_apps_number on public.student_applications(application_number);
create index if not exists idx_student_apps_created on public.student_applications(created_at desc);
create index if not exists idx_app_docs_app_id on public.application_documents(application_id);
create index if not exists idx_app_timeline_app_id on public.application_timeline(application_id);
create index if not exists idx_app_notes_app_id on public.application_notes(application_id);
