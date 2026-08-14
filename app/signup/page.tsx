'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabaseBrowser';
import SupabaseNotConfigured from '@/components/SupabaseNotConfigured';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isSupabaseConfigured()) return <SupabaseNotConfigured />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If your Supabase project has "Confirm email" turned off, this session
    // is already active and we can go straight in. Otherwise Supabase sends
    // a confirmation email and there's no session yet.
    if (data.session) {
      router.push('/profile');
      router.refresh();
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col items-center justify-center px-6 text-center sm:px-8">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 dark:bg-emerald-900/40">
          ✓
        </div>
        <h1 className="mb-3 font-display text-xl font-extrabold">Check your email</h1>
        <p className="text-ink-soft dark:text-white/50">
          We sent a confirmation link to <span className="font-semibold text-ink dark:text-white">{email}</span>.
          Click it to activate your account, then come back and log in.
        </p>
        <Link href="/login" className="mt-6 font-semibold text-coral-deep">
          Go to login →
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col justify-center px-6 py-14 sm:px-8">
      <h1 className="mb-2 font-display text-2xl font-extrabold">Create your account</h1>
      <p className="mb-8 text-sm text-ink-soft dark:text-white/50">
        Sync bookmarks, history, and Manga Coins across devices.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="rounded-md border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-md border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
        />
        <input
          placeholder="Password (min. 6 characters)"
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
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft dark:text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-coral-deep">
          Log in
        </Link>
      </p>
    </main>
  );
}
