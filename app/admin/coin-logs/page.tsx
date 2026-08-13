'use client';

import { useCoinStore } from '@/lib/coinStore';

export default function AdminCoinLogsPage() {
  const { transactionLogs, ready } = useCoinStore();

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Coin Transaction Log</h2>
      {!ready ? null : transactionLogs.length === 0 ? (
        <p className="text-ink-soft dark:text-white/50">No transactions yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-black/5 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
          {transactionLogs.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3.5 text-sm">
              <div>
                <div className="font-semibold">{t.description}</div>
                <div className="text-xs text-ink-soft dark:text-white/40">{new Date(t.date).toLocaleString()}</div>
              </div>
              <span className={`font-display text-lg font-extrabold ${t.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {t.amount > 0 ? '+' : ''}
                {t.amount} Coins
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
