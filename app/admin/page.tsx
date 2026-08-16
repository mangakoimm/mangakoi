'use client';

import { useCoinStore } from '@/lib/coinStore';

export default function AdminDashboard() {
  const { topUpRequests, transactionLogs, coinBalance, ready } = useCoinStore();
  const pending = topUpRequests.filter((r) => r.status === 'pending').length;
  const totalIssued = transactionLogs.filter((t) => t.type === 'topup').reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { label: 'Pending Requests', value: ready ? pending : '—' },
    { label: 'Total Coins Issued', value: ready ? totalIssued : '—' },
    { label: 'Demo Wallet Balance', value: ready ? coinBalance : '—' },
    { label: 'Registered Users', value: 4 }
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#1f1a16]">
            <div className="font-display text-2xl font-extrabold">{s.value}</div>
            <div className="text-sm text-ink-soft dark:text-white/50">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-ink-soft dark:text-white/50">
        This dashboard reflects the demo wallet stored in this browser. Approve a pending request under{' '}
        <span className="font-semibold text-coral-deep">Top Up Requests</span> to see the balance update live.
      </p>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabaseBrowser';
import { useClientStore } from '@/lib/clientStore';
import { useCoinStore } from '@/lib/coinStore';
import { mockManga } from '@/lib/mockData';
import MangaCard from '@/components/MangaCard';
import SupabaseNotConfigured from '@/components/SupabaseNotConfigured';

type AuthUser = { email: string; username: string | null; isAdmin: boolean } | null;

export default function ProfilePage() {
  const router = useRouter();
  const { bookmarks, history } = useClientStore();
  const { coinBalance, totalPurchased, totalSpent, unlockedChapters, ready: coinReady } = useCoinStore();

  const [user, setUser] = useState<AuthUser>(null);
  const [checking, setChecking] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setChecking(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, is_admin')
        .eq('id', authUser.id)
        .single();
      setUser({ email: authUser.email ?? '', username: profile?.username ?? null, isAdmin: profile?.is_admin ?? false });
      setChecking(false);
    });
  }, [router, configured]);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (!configured) return <SupabaseNotConfigured />;

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

  if (checking) {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-14 sm:px-8">
        <p className="text-ink-soft dark:text-white/50">Loading your profile…</p>
      </main>
    );
  }

  if (!user) return null; // redirecting to /login

  const initials = (user.username || user.email).slice(0, 2).toUpperCase();

  return (
    <main className="mx-auto max-w-[900px] px-6 py-14 sm:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-coral to-gold text-xl font-bold text-white shadow-[0_4px_12px_rgba(233,107,107,0.35)]">
            {initials}
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">{user.username || 'Your account'}</h1>
            <p className="text-sm text-ink-soft dark:text-white/50">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex-shrink-0 rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold hover:bg-black/[0.03] disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      <div className="mb-6 rounded-lg border border-black/10 bg-gradient-to-br from-gold/10 to-coral/10 p-6 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-ink-soft dark:text-white/50">Manga Coin Balance</div>
            <div className="font-display text-3xl font-extrabold">🪙 {coinReady ? coinBalance : '—'}</div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <div className="text-ink-soft dark:text-white/50">Purchased</div>
              <div className="font-bold">{coinReady ? totalPurchased : '—'}</div>
            </div>
            <div>
              <div className="text-ink-soft dark:text-white/50">Spent</div>
              <div className="font-bold">{coinReady ? totalSpent : '—'}</div>
            </div>
          </div>
          <Link href="/topup" className="rounded-full bg-gradient-to-br from-coral to-coral-deep px-5 py-2.5 text-sm font-bold text-white">
            Top Up
          </Link>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-4 ${user.isAdmin ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
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
        {user.isAdmin && (
          <Link href="/admin" className="rounded-lg border border-black/10 bg-white p-5 transition-colors hover:border-coral dark:border-white/10 dark:bg-[#1f1a16]">
            <div className="mb-1 font-display text-2xl font-extrabold">⚙️</div>
            <div className="text-sm text-ink-soft dark:text-white/50">Admin panel</div>
          </Link>
        )}
      </div>

      <h2 className="mb-4 mt-10 font-display text-xl font-bold">Unlocked Chapters</h2>
      {!coinReady ? null : unlockedManga.length === 0 ? (
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
        Bookmarks, history, and coins are still saved to this browser only (localStorage) — the next step is
        moving them into the real `bookmarks`, `reading_history`, and `wallets` tables now that accounts exist.
      </p>
    </main>
  );
}
