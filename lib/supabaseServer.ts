import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Use this in Server Components and Route Handlers to read the logged-in
// user from cookies. `await cookies()` works whether your Next.js version
// returns it synchronously (14) or as a Promise (15+) — awaiting a plain
// object just resolves to itself.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — safe to ignore since
          // middleware.ts refreshes the session on every request instead.
        }
      }
    }
  });
}