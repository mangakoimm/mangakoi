# MangaKoi

A manga reading site built with Next.js (App Router, TypeScript, Tailwind) and Supabase (Postgres + Storage + Auth).

## 1. Create your database

1. Go to [supabase.com](https://supabase.com), sign up, and create a new project (pick any name/region, save the database password it gives you).
2. Once it's ready, open **SQL Editor** in the left sidebar, paste the contents of `supabase/schema.sql`, and run it. This creates all the tables.
3. Optionally run `supabase/seed.sql` the same way to load a few sample titles so the site isn't empty.

## 2. Connect the app to your database

1. In Supabase, go to **Project Settings -> API**.
2. Copy the **Project URL** and **anon public** key.
3. Copy `.env.example` to `.env.local` and paste them in:
   ```
   cp .env.example .env.local
   ```

## 3. Run it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. If you ran the seed SQL, you should see sample manga on the home page.

## 4. Add your own manga (three ways)

**Easiest — Supabase Table Editor** (no code): go to your Supabase project -> Table Editor -> `manga` table -> Insert row. Fill in title, slug (URL-friendly, e.g. `my-manga-title`), description, status. Do the same in `chapters` (linked to the manga's id) and `pages` (linked to the chapter's id, one row per image).

**Script** — edit and run `scripts/seed.ts` as a template for adding titles programmatically:
```bash
npm run seed
```

**Build an admin page** (next step once you're comfortable) — a simple form in the app that inserts into these tables, so you don't need to open Supabase directly every time.

## 5. Upload cover and page images

Go to Supabase -> **Storage** -> Create a new bucket (e.g. `covers` and `chapter-pages`, both set to public). Upload your images there, copy the public URL for each file, and paste it into the `cover_url` / `image_url` columns.

## 6. Deploy it live

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), sign up, and import the repo.
3. In the Vercel project settings, add the same environment variables from `.env.local`.
4. Deploy. Vercel gives you a live URL, and redeploys automatically on every push.

## Project structure

```
app/                Next.js pages (App Router)
  page.tsx           Home page — fetches manga list from Supabase
  manga/[slug]/       Manga detail page — chapter list
  reader/[slug]/[chapter]/   Reader page — pulls page images for a chapter
components/          Reusable UI (Nav, Footer, MangaCard)
lib/supabase.ts      Database client and query functions
supabase/schema.sql  Database schema — run this first
supabase/seed.sql    Optional sample data
scripts/seed.ts      Example of adding data from a script instead of the UI
```

## What's not built yet

This is a working foundation, not the full feature set from the original design (auth/login, bookmarks UI, reader controls, genre pages, community features). The database schema already has tables for bookmarks, reading history, and user profiles — the next step is wiring up Supabase Auth and building those pages the same way `app/page.tsx` reads from `manga`.
