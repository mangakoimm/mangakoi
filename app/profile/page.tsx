'use client';

import Link from 'next/link';
import { useClientStore } from '@/lib/clientStore';
import { useCoinStore } from '@/lib/coinStore';
import { mockManga } from '@/lib/mockData';
import MangaCard from '@/components/MangaCard';

export default function ProfilePage() {
  const { bookmarks, history } = useClientStore();
  const { coinBalance, totalPurchased, totalSpent, unlockedChapters, ready } = useCoinStore();

  // Group unlocked chapter keys ("slug:number") back to their manga.
  const unlockedByManga = new Map<string, number[]>();
  unlockedChapters.forEach((key) => {
    const [slug, num] = key.split(':');
    const list = unlockedByManga.get(slug) ?? [];
    list.push(Number(num));
    unlockedByManga.set(slug, list);
  });
  const unlockedManga = Array.from(unlockedByManga.keys())
    .map((slug) => mockManga.find((m) => m.slug === slug))
    .filter(Boolean) as typeof mockManga;

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

      <div className="mb-6 rounded-lg border border-black/10 bg-gradient-to-br from-gold/10 to-coral/10 p-6 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-ink-soft dark:text-white/50">Manga Coin Balance</div>
            <div className="font-display text-3xl font-extrabold">🪙 {ready ? coinBalance : '—'}</div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <div className="text-ink-soft dark:text-white/50">Purchased</div>
              <div className="font-bold">{ready ? totalPurchased : '—'}</div>
            </div>
            <div>
              <div className="text-ink-soft dark:text-white/50">Spent</div>
              <div className="font-bold">{ready ? totalSpent : '—'}</div>
            </div>
          </div>
          <Link href="/topup" className="rounded-full bg-gradient-to-br from-coral to-coral-deep px-5 py-2.5 text-sm font-bold text-white">
            Top Up
          </Link>
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
        <Link href="/topup/history" className="rounded-lg border border-black/10 bg-white p-5 transition-colors hover:border-coral dark:border-white/10 dark:bg-[#1f1a16]">
          <div className="mb-1 font-display text-2xl font-extrabold">{unlockedChapters.length}</div>
          <div className="text-sm text-ink-soft dark:text-white/50">Unlocked chapters</div>
        </Link>
        <Link href="/admin" className="rounded-lg border border-black/10 bg-white p-5 transition-colors hover:border-coral dark:border-white/10 dark:bg-[#1f1a16]">
          <div className="mb-1 font-display text-2xl font-extrabold">⚙️</div>
          <div className="text-sm text-ink-soft dark:text-white/50">Admin panel</div>
        </Link>
      </div>

      <h2 className="mb-4 mt-10 font-display text-xl font-bold">Unlocked Chapters</h2>
      {!ready ? null : unlockedManga.length === 0 ? (
        <p className="text-sm text-ink-soft dark:text-white/50">
          Nothing unlocked yet — unlock a locked chapter with Manga Coins to see it here.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {unlockedManga.map((m) => (
            <MangaCard key={m.id} manga={m} />
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-ink-soft dark:text-white/40">
        Once accounts are wired up (see the `profiles` table in `supabase/schema.sql`), this page will show your
        real account details instead of a demo placeholder.
      </p>
    </main>
  );
}
