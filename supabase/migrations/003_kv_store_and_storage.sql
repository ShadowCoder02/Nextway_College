-- Generic JSON key/value store, replacing the Vercel Blob-backed JSON
-- "database" (src/lib/cms/blob-json-store.ts) after that store's billing
-- was suspended. Same one-document-per-collection shape the app already
-- uses (admissions.json, programmes.json, news.json, events.json,
-- careers.json, enquiries.json) — only the backing store changes.
create table if not exists public.kv_store (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.kv_store enable row level security;
-- No policies: all access goes through the server-side service role key,
-- which bypasses RLS entirely. Anon/authenticated access is denied by
-- default with RLS enabled and no matching policy.

-- Private bucket for applicant-uploaded documents (NIC/passport scans,
-- photos), replacing the same Blob store's file storage
-- (src/lib/admissions/file-security.ts). Never public — served only
-- through the app's authenticated document-proxy route.
insert into storage.buckets (id, name, public)
values ('applications', 'applications', false)
on conflict (id) do nothing;
