'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCoinStore } from '@/lib/coinStore';
import { useToast } from '@/lib/toastStore';

type DialogState = 'confirm' | 'insufficient' | null;

export function useUnlockFlow(mangaSlug: string) {
  const { coinBalance, unlockChapter } = useCoinStore();
  const { showToast } = useToast();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [pendingChapter, setPendingChapter] = useState<number | null>(null);
  const [pendingCost, setPendingCost] = useState(0);
  const [onUnlocked, setOnUnlocked] = useState<(() => void) | null>(null);

  function requestUnlock(chapterNumber: number, cost: number, after?: () => void) {
    setPendingChapter(chapterNumber);
    setPendingCost(cost);
    setOnUnlocked(() => after ?? null);
    setDialog('confirm');
  }

  function confirmUnlock() {
    if (pendingChapter == null) return;
    const success = unlockChapter(mangaSlug, pendingChapter, pendingCost);
    if (success) {
      showToast('🔓 Chapter unlocked.');
      setDialog(null);
      onUnlocked?.();
    } else {
      setDialog('insufficient');
    }
  }

  function closeDialog() {
    setDialog(null);
  }

  const dialogNode =
    dialog === 'confirm' ? (
      <UnlockConfirmDialog
        chapterNumber={pendingChapter!}
        cost={pendingCost}
        balance={coinBalance}
        onCancel={closeDialog}
        onConfirm={confirmUnlock}
      />
    ) : dialog === 'insufficient' ? (
      <InsufficientDialog onCancel={closeDialog} />
    ) : null;

  return { requestUnlock, dialogNode };
}

function DialogShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
      <div className="relative w-full max-w-[360px] rounded-lg border border-black/10 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-[#221c18]">
        {children}
      </div>
    </div>
  );
}

function UnlockConfirmDialog({
  chapterNumber,
  cost,
  balance,
  onCancel,
  onConfirm
}: {
  chapterNumber: number;
  cost: number;
  balance: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogShell>
      <h3 className="mb-4 font-display text-lg font-extrabold">Unlock Chapter {chapterNumber}?</h3>
      <div className="mb-5 flex items-center justify-around text-sm">
        <div>
          <div className="text-ink-soft dark:text-white/50">Cost</div>
          <div className="mt-1 font-display text-xl font-extrabold text-gold">🪙 {cost}</div>
        </div>
        <div>
          <div className="text-ink-soft dark:text-white/50">Current Balance</div>
          <div className="mt-1 font-display text-xl font-extrabold">🪙 {balance}</div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-full border border-black/10 py-2.5 text-sm font-semibold hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-full bg-gradient-to-br from-coral to-coral-deep py-2.5 text-sm font-semibold text-white"
        >
          Unlock Now
        </button>
      </div>
    </DialogShell>
  );
}

function InsufficientDialog({ onCancel }: { onCancel: () => void }) {
  return (
    <DialogShell>
      <div className="mb-3 text-3xl">🪙</div>
      <h3 className="mb-5 font-display text-lg font-extrabold">Not enough Manga Coins.</h3>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-full border border-black/10 py-2.5 text-sm font-semibold hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <Link
          href="/topup"
          className="flex-1 rounded-full bg-gradient-to-br from-gold to-coral py-2.5 text-sm font-semibold text-white"
        >
          Top Up
        </Link>
      </div>
    </DialogShell>
  );
}
