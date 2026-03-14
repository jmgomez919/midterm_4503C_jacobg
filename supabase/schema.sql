-- ============================================================
-- Media Tracker — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================


-- ── favorites ────────────────────────────────────────────────
-- Stores which media items each user has favorited.
-- media_data (jsonb) holds the full item snapshot so we can
-- display favorites without a join to any other table.

create table if not exists favorites (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade not null,
  media_id    text        not null,   -- String(item.id) for sample items; UUID for custom
  media_data  jsonb       not null,   -- { id, title, type, genre, year, description }
  created_at  timestamptz default now(),
  unique (user_id, media_id)
);

alter table favorites enable row level security;

create policy "Users manage their own favorites"
  on favorites for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── custom_media ──────────────────────────────────────────────
-- Media entries added manually by a user via the Add Media form.
-- The Supabase-generated UUID becomes the item's id in the app.

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


-- ── media_statuses ────────────────────────────────────────────
-- (Future feature) Per-user status for any media item.
-- status options: 'want_to' | 'in_progress' | 'completed'

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
-- (Future feature) Per-user 1–5 star rating for any media item.

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
-- (Future feature) Per-user text review for any media item.

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
