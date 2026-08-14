'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabaseBrowser';
import SupabaseNotConfigured from '@/components/SupabaseNotConfigured';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) return <SupabaseNotConfigured />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push('/profile');
    router.refresh(); // re-fetch the server-rendered Nav so it shows as logged in
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col justify-center px-6 py-14 sm:px-8">
      <h1 className="mb-2 font-display text-2xl font-extrabold">Log in</h1>
      <p className="mb-8 text-sm text-ink-soft dark:text-white/50">Welcome back to MangaKoi.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-md border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-md border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
        />

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-gradient-to-br from-coral to-coral-deep py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft dark:text-white/50">
        Don't have an account?{' '}
        <Link href="/signup" className="font-semibold text-coral-deep">
          Sign up
        </Link>
      </p>
    </main>
  );
}
