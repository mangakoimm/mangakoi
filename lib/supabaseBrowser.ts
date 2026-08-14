import { createBrowserClient } from '@supabase/ssr';

// Use this in Client Components ('use client') for auth actions —
// signInWithPassword, signUp, signOut, and reading the current session.
// This is separate from lib/supabase.ts, which is a plain client used only
// for reading public catalog data (manga/chapters/pages).
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Check this before calling createSupabaseBrowserClient() anywhere auth is
// optional — createBrowserClient() throws immediately if the env vars are
// missing, which would otherwise crash the whole page instead of showing a
// friendly "not set up yet" message.
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}