'use client';

import Link from 'next/link';
import { useClientStore } from '@/lib/clientStore';

export default function ProfilePage() {
  const { bookmarks, history } = useClientStore();

  return (
    <main className="mx-auto max-w-[900px] px-6 py-14 sm:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-coral to-gold text-xl font-bold text-white shadow-[0_4px_12px_rgba(233,107,107,0.35)]">
          YK
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold">Demo account</h1>
          <p className="text-sm text-ink-soft dark:text-white/50">Sign-in isn't wired up yet — this is a preview profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link href="/bookmarks" className="rounded-lg border border-black/10 bg-white p-5 transition-colors hover:border-coral dark:border-white/10 dark:bg-[#1f1a16]">
          <div className="mb-1 font-display text-2xl font-extrabold">{bookmarks.length}</div>
          <div className="text-sm text-ink-soft dark:text-white/50">Bookmarks</div>
        </Link>
        <Link href="/history" className="rounded-lg border border-black/10 bg-white p-5 transition-colors hover:border-coral dark:border-white/10 dark:bg-[#1f1a16]">
          <div className="mb-1 font-display text-2xl font-extrabold">{history.length}</div>
          <div className="text-sm text-ink-soft dark:text-white/50">History</div>
        </Link>
      </div>

      <p className="mt-10 text-xs text-ink-soft dark:text-white/40">
        Once accounts are wired up (see the `profiles` table in `supabase/schema.sql`), this page will show your
        real account details instead of a demo placeholder.
      </p>
    </main>
  );
}
