-- MangaKoi database schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)

create extension if not exists "pgcrypto";

-- ---------- Manga ----------
create table if not exists manga (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  author text,
  artist text,
  cover_url text,
  status text not null default 'ongoing' check (status in ('ongoing','completed','hiatus')),
  release_year int,
  rating numeric(2,1) default 0,
  views bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Genres (many-to-many) ----------
create table if not exists genres (
  id serial primary key,
  name text unique not null
);

create table if not exists manga_genres (
  manga_id uuid references manga(id) on delete cascade,
  genre_id int references genres(id) on delete cascade,
  primary key (manga_id, genre_id)
);

-- ---------- Chapters ----------
create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid references manga(id) on delete cascade,
  number numeric not null,
  title text,
  published_at timestamptz default now(),
  unique (manga_id, number)
);

-- ---------- Pages (the actual images inside a chapter) ----------
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references chapters(id) on delete cascade,
  page_number int not null,
  image_url text not null,
  unique (chapter_id, page_number)
);

-- ---------- Users (extends Supabase auth.users) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);

-- ---------- Bookmarks ----------
create table if not exists bookmarks (
  user_id uuid references profiles(id) on delete cascade,
  manga_id uuid references manga(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, manga_id)
);

-- ---------- Reading history / progress ----------
create table if not exists reading_history (
  user_id uuid references profiles(id) on delete cascade,
  manga_id uuid references manga(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  last_page int default 1,
  updated_at timestamptz default now(),
  primary key (user_id, manga_id)
);

-- ---------- Helpful indexes ----------
create index if not exists idx_chapters_manga on chapters(manga_id);
create index if not exists idx_pages_chapter on pages(chapter_id);
create index if not exists idx_manga_status on manga(status);
create index if not exists idx_manga_rating on manga(rating desc);

-- ---------- Row Level Security ----------
-- Public read access to catalog data; writes restricted to the service role (your admin scripts/API).
alter table manga enable row level security;
alter table chapters enable row level security;
alter table pages enable row level security;
alter table genres enable row level security;
alter table manga_genres enable row level security;

create policy "Public can read manga" on manga for select using (true);
create policy "Public can read chapters" on chapters for select using (true);
create policy "Public can read pages" on pages for select using (true);
create policy "Public can read genres" on genres for select using (true);
create policy "Public can read manga_genres" on manga_genres for select using (true);

-- Bookmarks / history are private to each signed-in user
alter table bookmarks enable row level security;
alter table reading_history enable row level security;
alter table profiles enable row level security;

create policy "Users manage their own bookmarks" on bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own history" on reading_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
