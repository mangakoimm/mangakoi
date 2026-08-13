'use client';

import { useCoinStore } from '@/lib/coinStore';

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
};

export default function TopUpHistoryPage() {
  const { topUpRequests, ready } = useCoinStore();

  return (
    <main className="mx-auto max-w-[720px] px-6 py-14 sm:px-8">
      <h1 className="mb-2 font-display text-3xl font-extrabold">Purchase history</h1>
      <p className="mb-8 text-ink-soft dark:text-white/50">Every top-up request you've submitted.</p>

      {!ready ? null : topUpRequests.length === 0 ? (
        <p className="text-ink-soft dark:text-white/50">No requests yet.</p>
      ) : (
        <div className="relative flex flex-col gap-4 border-l-2 border-black/10 pl-6 dark:border-white/10">
          {topUpRequests.map((r) => (
            <div key={r.id} className="relative rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#1f1a16]">
              <div className="absolute -left-[31px] top-6 h-3 w-3 rounded-full bg-coral" />
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-ink-soft dark:text-white/50">
                  {new Date(r.date).toLocaleString()}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyle[r.status]}`}>
                  {r.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-lg font-extrabold">🪙 {r.packageCoins} Coins</div>
                  <div className="text-sm text-ink-soft dark:text-white/50">{r.priceLabel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
