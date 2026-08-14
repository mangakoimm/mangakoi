import Link from 'next/link';

export default function SupabaseNotConfigured() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[440px] flex-col items-center justify-center px-6 text-center sm:px-8">
      <div className="mb-4 text-3xl">🔌</div>
      <h1 className="mb-3 font-display text-xl font-extrabold">Accounts aren't set up yet</h1>
      <p className="mb-6 text-sm text-ink-soft dark:text-white/50">
        Sign-in needs a real Supabase project connected. Copy <code>.env.example</code> to{' '}
        <code>.env.local</code>, add your Supabase URL and anon key, then restart the dev server.
      </p>
      <Link href="/" className="font-semibold text-coral-deep">
        ← Back to MangaKoi
      </Link>
    </main>
  );
}
