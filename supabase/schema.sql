-- ============================================================
-- Media Tracker — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================


-- ── favorites ────────────────────────────────────────────────
create table if not exists favorites (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade not null,
  media_id    text        not null,
  media_data  jsonb       not null,
  created_at  timestamptz default now(),
  unique (user_id, media_id)
);
alter table favorites enable row level security;
create policy "Users manage their own favorites"
  on favorites for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── custom_media ──────────────────────────────────────────────
create table if not exists custom_media (
  id          uuid    primary key default gen_random_uuid(),
  user_id     uuid    references auth.users(id) on delete cascade not null,
  title       text    not null,
  type        text    not null check (type in ('movie', 'book')),
  genre       text    not null,
  year        integer not null check (year between 1800 and 2100),
  description text    not null,
  created_at  timestamptz default now()
);
alter table custom_media enable row level security;
create policy "Users manage their own custom media"
  on custom_media for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── media_images ──────────────────────────────────────────────
-- Stores references to images in Supabase Storage.
-- media_id is a string: numeric for sample items, UUID for custom ones.
-- position (0–4) determines display order; max 5 images per item per user.

create table if not exists media_images (
  id           uuid    primary key default gen_random_uuid(),
  user_id      uuid    references auth.users(id) on delete cascade not null,
  media_id     text    not null,
  storage_path text    not null,
  position     integer not null default 0,
  created_at   timestamptz default now(),
  unique (user_id, media_id, position)
);
alter table media_images enable row level security;
create policy "Users manage their own images"
  on media_images for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── media_statuses ────────────────────────────────────────────
create table if not exists media_statuses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  media_id    text not null,
  status      text not null check (status in ('want_to', 'in_progress', 'completed')),
  updated_at  timestamptz default now(),
  unique (user_id, media_id)
);
alter table media_statuses enable row level security;
create policy "Users manage their own statuses"
  on media_statuses for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── media_ratings ─────────────────────────────────────────────
create table if not exists media_ratings (
  id          uuid    primary key default gen_random_uuid(),
  user_id     uuid    references auth.users(id) on delete cascade not null,
  media_id    text    not null,
  rating      integer not null check (rating between 1 and 5),
  updated_at  timestamptz default now(),
  unique (user_id, media_id)
);
alter table media_ratings enable row level security;
create policy "Users manage their own ratings"
  on media_ratings for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── media_reviews ─────────────────────────────────────────────
create table if not exists media_reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  media_id    text not null,
  review      text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, media_id)
);
alter table media_reviews enable row level security;
create policy "Users manage their own reviews"
  on media_reviews for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- STORAGE SETUP (run these steps in the Supabase Dashboard)
-- ============================================================
-- 1. Go to Storage → New bucket
-- 2. Name: media-images
-- 3. Check "Public bucket" so images load without auth tokens
-- 4. Click Create
--
-- Then go to Storage → Policies and add these three policies
-- for the media-images bucket:
--
-- Policy 1 — Authenticated users can upload to their own folder:
--   Operation: INSERT
--   Policy name: "Users upload to own folder"
--   WITH CHECK: (auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy 2 — Anyone can view images (needed for public URLs):
--   Operation: SELECT
--   Policy name: "Public read"
--   USING: true
--
-- Policy 3 — Users can delete their own images:
--   Operation: DELETE
--   Policy name: "Users delete own images"
--   USING: (auth.uid()::text = (storage.foldername(name))[1])
-- ============================================================
