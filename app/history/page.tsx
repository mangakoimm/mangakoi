'use client';

import Link from 'next/link';
import { useClientStore } from '@/lib/clientStore';
import { mockManga } from '@/lib/mockData';
import MangaCard from '@/components/MangaCard';

export default function HistoryPage() {
  const { history, ready } = useClientStore();
  const items = history.map((slug) => mockManga.find((m) => m.slug === slug)).filter(Boolean) as typeof mockManga;

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-14 sm:px-8">
      <h1 className="mb-2 font-display text-3xl font-extrabold">Reading history</h1>
      <p className="mb-8 text-ink-soft dark:text-white/50">Everything you've opened, most recent first.</p>

      {!ready ? null : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/10 p-10 text-center text-ink-soft dark:border-white/10 dark:text-white/50">
          <p className="mb-3">No reading history yet.</p>
          <Link href="/#trending" className="font-semibold text-coral-deep">
            Start reading something →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <MangaCard key={m.id} manga={m} />
          ))}
        </div>
      )}
    </main>
  );
}
