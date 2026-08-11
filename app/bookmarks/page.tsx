'use client';

import Link from 'next/link';
import { useClientStore } from '@/lib/clientStore';
import { mockManga } from '@/lib/mockData';
import MangaCard from '@/components/MangaCard';

export default function BookmarksPage() {
  const { bookmarks, ready } = useClientStore();
  const items = bookmarks.map((slug) => mockManga.find((m) => m.slug === slug)).filter(Boolean) as typeof mockManga;

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-14 sm:px-8">
      <h1 className="mb-2 font-display text-3xl font-extrabold">Bookmarks</h1>
      <p className="mb-8 text-ink-soft dark:text-white/50">Titles you've saved to come back to.</p>

      {!ready ? null : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/10 p-10 text-center text-ink-soft dark:border-white/10 dark:text-white/50">
          <p className="mb-3">No bookmarks yet.</p>
          <Link href="/#trending" className="font-semibold text-coral-deep">
            Browse trending titles →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <MangaCard key={m.id} manga={m} />
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-ink-soft dark:text-white/40">
        Bookmarks are currently saved to this browser only. Once accounts are wired up, they'll sync to your
        MangaKoi account instead.
      </p>
    </main>
  );
}
