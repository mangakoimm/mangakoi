import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Bypasses Row Level Security entirely — this is what lets an admin action
// write to `manga`, `chapters`, and `pages` even though the public anon key
// (lib/supabase.ts) is only allowed to read them. The `server-only` import
// above makes Next.js throw a build error if this file is ever accidentally
// imported into a Client Component, since that would leak the service role
// key to the browser.
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) must be set in .env.local for admin uploads to work.'
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}