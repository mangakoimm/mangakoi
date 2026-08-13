'use client';

import Link from 'next/link';
import { useCoinStore } from '@/lib/coinStore';

export default function CoinBadge({ className = '' }: { className?: string }) {
  const { coinBalance, ready } = useCoinStore();

  return (
    <Link
      href="/topup"
      className={`flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3.5 py-2 text-[13.5px] font-bold text-ink transition-colors hover:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white ${className}`}
    >
      <span>🪙</span>
      <span>{ready ? coinBalance : '—'}</span>
    </Link>
  );
}
