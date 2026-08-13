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
