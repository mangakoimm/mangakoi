'use client';

import { useState } from 'react';
import { useCoinStore, type TopUpRequest } from '@/lib/coinStore';
import { useToast } from '@/lib/toastStore';

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
};

export default function AdminRequestsPage() {
  const { topUpRequests, approveTopUp, rejectTopUp, ready } = useCoinStore();
  const { showToast } = useToast();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const confirmTarget = topUpRequests.find((r) => r.id === confirmId);

  function handleApprove(req: TopUpRequest) {
    approveTopUp(req.id);
    showToast(`🪙 ${req.packageCoins} Coins added.`);
    setConfirmId(null);
  }

  function handleReject(req: TopUpRequest) {
    rejectTopUp(req.id);
    showToast('❌ Payment rejected.');
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Top Up Requests</h2>
      {!ready ? null : topUpRequests.length === 0 ? (
        <p className="text-ink-soft dark:text-white/50">No requests yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-black/[0.02] text-xs uppercase tracking-wide text-ink-soft dark:bg-white/5 dark:text-white/50">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Screenshot</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topUpRequests.map((r) => (
                <tr key={r.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral to-gold text-xs font-bold text-white">
                        {r.fullName.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <div className="font-semibold">{r.fullName || 'Unknown'}</div>
                        <div className="text-xs text-ink-soft dark:text-white/40">{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">🪙 {r.packageCoins}<div className="text-xs text-ink-soft dark:text-white/40">{r.priceLabel}</div></td>
                  <td className="px-4 py-3">
                    {r.screenshotDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.screenshotDataUrl} alt="screenshot" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <span className="text-xs text-ink-soft dark:text-white/40">{r.screenshotName || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{r.transactionId || '—'}</td>
                  <td className="px-4 py-3 text-xs text-ink-soft dark:text-white/40">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyle[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmId(r.id)}
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r)}
                          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold dark:border-white/10"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-soft dark:text-white/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
          <div className="relative w-full max-w-[340px] rounded-lg border border-black/10 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-[#221c18]">
            <h3 className="mb-5 font-display text-lg font-extrabold">Approve this payment?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-full border border-black/10 py-2.5 text-sm font-semibold dark:border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(confirmTarget)}
                className="flex-1 rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
