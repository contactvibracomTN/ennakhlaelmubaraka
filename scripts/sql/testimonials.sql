-- Testimonials table for Neon Postgres.
-- Run this once in the Neon SQL Editor (or with psql) before deploying.
-- The application uses the pooled DATABASE_URL; this SQL only needs a
-- connection with DDL rights (the Neon SQL Editor is enough).

create table if not exists public.testimonials (
  id text primary key,
  name text not null,
  whatsapp text not null,
  job text,
  nationality text,
  country_code text,
  message text not null,
  rating smallint not null check (rating between 1 and 5),
  locale text not null default 'ar',
  status text not null default 'pending' check (status in ('pending', 'published', 'archived')),
  source text not null default 'website' check (source in ('website', 'in-store', 'import')),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  published_at timestamptz,
  published_text jsonb not null default '{}'::jsonb,
  admin_note text,
  sort_order integer
);

-- Existing installations: add the flag column without dropping data.
-- (Safe to run repeatedly; `create table if not exists` above is a no-op once
-- the table exists, so this statement is what upgrades an older database.)
alter table public.testimonials
  add column if not exists country_code text;

create index if not exists testimonials_status_published_at_idx
  on public.testimonials (status, published_at desc nulls last);
