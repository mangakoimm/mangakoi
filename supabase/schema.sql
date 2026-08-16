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
  coin_cost int not null default 0, -- 0 = free; >0 = coins required to unlock
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
  is_admin boolean not null default false,
  created_at timestamptz default now()
);

-- Safe to re-run even if you already ran an older version of this schema —
-- adds the column only if it isn't there yet.
alter table profiles add column if not exists is_admin boolean not null default false;

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

-- ---------- Manga Coins ----------
-- Wallet balance per user. In the shipped app this is currently simulated
-- client-side with localStorage (lib/coinStore.tsx) since there's no auth
-- wired up yet — these tables are here so a real backend can take over
-- without changing the app's data shape.
create table if not exists wallets (
  user_id uuid primary key references profiles(id) on delete cascade,
  coin_balance int not null default 0,
  total_purchased int not null default 0,
  total_spent int not null default 0,
  updated_at timestamptz default now()
);

create table if not exists coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null check (type in ('topup', 'unlock')),
  amount int not null, -- positive for topup, negative for unlock
  description text,
  created_at timestamptz default now()
);

create table if not exists topup_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  package_coins int not null,
  price_label text not null,
  full_name text not null,
  email text not null,
  transaction_id text,
  notes text,
  screenshot_url text, -- upload to a "topup-screenshots" storage bucket, store the public URL here
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

create table if not exists unlocked_chapters (
  user_id uuid references profiles(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  unlocked_at timestamptz default now(),
  primary key (user_id, chapter_id)
);

-- ---------- Helpful indexes ----------
create index if not exists idx_chapters_manga on chapters(manga_id);
create index if not exists idx_pages_chapter on pages(chapter_id);
create index if not exists idx_manga_status on manga(status);
create index if not exists idx_manga_rating on manga(rating desc);
create index if not exists idx_coin_tx_user on coin_transactions(user_id);
create index if not exists idx_topup_status on topup_requests(status);

-- ---------- Row Level Security ----------
-- Public read access to catalog data; writes restricted to the service role (your admin scripts/API).
alter table manga enable row level security;
alter table chapters enable row level security;
alter table pages enable row level security;
alter table genres enable row level security;
alter table manga_genres enable row level security;

-- `create policy` has no "if not exists" option, so every policy below is
-- dropped first — this makes it safe to run this whole file again anytime
-- (e.g. after pulling schema changes) instead of erroring on the second run.
drop policy if exists "Public can read manga" on manga;
create policy "Public can read manga" on manga for select using (true);

drop policy if exists "Public can read chapters" on chapters;
create policy "Public can read chapters" on chapters for select using (true);

drop policy if exists "Public can read pages" on pages;
create policy "Public can read pages" on pages for select using (true);

drop policy if exists "Public can read genres" on genres;
create policy "Public can read genres" on genres for select using (true);

drop policy if exists "Public can read manga_genres" on manga_genres;
create policy "Public can read manga_genres" on manga_genres for select using (true);

-- Bookmarks / history are private to each signed-in user
alter table bookmarks enable row level security;
alter table reading_history enable row level security;
alter table profiles enable row level security;

drop policy if exists "Users manage their own bookmarks" on bookmarks;
create policy "Users manage their own bookmarks" on bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own history" on reading_history;
create policy "Users manage their own history" on reading_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own profile" on profiles;
create policy "Users manage their own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Wallets, transactions, top-up requests, and unlocks are private to each
-- signed-in user. Admins approving top-ups should use the service role key
-- (bypasses RLS) from a trusted server context, not the anon client key.
alter table wallets enable row level security;
alter table coin_transactions enable row level security;
alter table topup_requests enable row level security;
alter table unlocked_chapters enable row level security;

drop policy if exists "Users manage their own wallet" on wallets;
create policy "Users manage their own wallet" on wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own transactions" on coin_transactions;
create policy "Users manage their own transactions" on coin_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own topup requests" on topup_requests;
create policy "Users manage their own topup requests" on topup_requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own unlocks" on unlocked_chapters;
create policy "Users manage their own unlocks" on unlocked_chapters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Auto-create a profile (and starter wallet) on signup ----------
-- Whenever someone signs up via Supabase Auth, this automatically creates
-- their row in `profiles` (and a zero-balance wallet), so the app never has
-- to do that as a separate manual step after signUp().
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');

  insert into public.wallets (user_id, coin_balance, total_purchased, total_spent)
  values (new.id, 0, 0, 0);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Prevent users from granting themselves admin ----------
-- The "Users manage their own profile" policy above lets a user update any
-- column on their own row — including is_admin, if nothing stops them. This
-- trigger silently reverts is_admin back to its previous value unless the
-- change comes from the service role key (i.e. trusted server-side code),
-- so the only way to become an admin is for you to set it directly in the
-- Table Editor (or via a service-role script), never through the app itself.
create or replace function public.prevent_self_admin_escalation()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() <> 'service_role' then
    new.is_admin = old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists prevent_self_admin_escalation on profiles;
create trigger prevent_self_admin_escalation
  before update on profiles
  for each row execute function public.prevent_self_admin_escalation();