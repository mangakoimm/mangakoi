'use client';

import { useCoinStore } from '@/lib/coinStore';
import { useUnlockFlow } from './UnlockDialog';

export default function ReaderGate({
  mangaSlug,
  chapterNumber,
  cost,
  children
}: {
  mangaSlug: string;
  chapterNumber: number;
  cost: number;
  children: React.ReactNode;
}) {
  const { isChapterUnlocked } = useCoinStore();
  const { requestUnlock, dialogNode } = useUnlockFlow(mangaSlug);

  const unlocked = cost === 0 || isChapterUnlocked(mangaSlug, chapterNumber);

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
      <h2 className="font-display text-xl font-bold">Chapter {chapterNumber} is locked</h2>
      <p className="text-white/60">Unlock this chapter for 🪙 {cost} Coins to keep reading.</p>
      <button
        onClick={() => requestUnlock(chapterNumber, cost)}
        className="mt-2 rounded-full bg-gradient-to-br from-coral to-coral-deep px-7 py-3 text-sm font-semibold"
      >
        Unlock Chapter
      </button>
      {dialogNode}
    </div>
  );
}
