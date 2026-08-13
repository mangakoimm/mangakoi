'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type TransactionLog = {
  id: string;
  date: string; // ISO
  type: 'topup' | 'unlock';
  amount: number; // positive for topup, negative for unlock
  description: string;
};

export type TopUpStatus = 'pending' | 'approved' | 'rejected';

export type TopUpRequest = {
  id: string;
  date: string; // ISO
  packageCoins: number;
  priceLabel: string;
  fullName: string;
  email: string;
  transactionId: string;
  notes: string;
  screenshotName: string;
  screenshotDataUrl: string | null;
  status: TopUpStatus;
};

type CoinState = {
  coinBalance: number;
  totalPurchased: number;
  totalSpent: number;
  unlockedChapters: string[]; // keys like "slug:chapterNumber"
  transactionLogs: TransactionLog[];
  topUpRequests: TopUpRequest[];
};

type CoinStoreShape = CoinState & {
  ready: boolean;
  isChapterUnlocked: (slug: string, chapterNumber: number) => boolean;
  unlockChapter: (slug: string, chapterNumber: number, cost: number) => boolean;
  submitTopUp: (data: {
    packageCoins: number;
    priceLabel: string;
    fullName: string;
    email: string;
    transactionId: string;
    notes: string;
    screenshotName: string;
    screenshotDataUrl: string | null;
  }) => void;
  approveTopUp: (id: string) => void;
  rejectTopUp: (id: string) => void;
};

const CoinContext = createContext<CoinStoreShape | null>(null);
const STORAGE_KEY = 'mangakoi:coins';

function defaultState(): CoinState {
  const now = Date.now();
  return {
    coinBalance: 30,
    totalPurchased: 100,
    totalSpent: 70,
    unlockedChapters: [],
    transactionLogs: [
      { id: 'tx-seed-1', date: new Date(now - 86400000 * 2).toISOString(), type: 'topup', amount: 100, description: 'Top up — 100 Coins' },
      { id: 'tx-seed-2', date: new Date(now - 86400000).toISOString(), type: 'unlock', amount: -5, description: 'Unlocked Chapter 120' }
    ],
    topUpRequests: [
      {
        id: 'req-seed-1',
        date: new Date(now - 86400000 * 2).toISOString(),
        packageCoins: 100,
        priceLabel: '5,000 MMK',
        fullName: 'Yuki Kobayashi',
        email: 'yuki@example.com',
        transactionId: '',
        notes: '',
        screenshotName: 'receipt.png',
        screenshotDataUrl: null,
        status: 'approved'
      }
    ]
  };
}

export function CoinStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CoinState>(defaultState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const persist = useCallback((next: CoinState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const isChapterUnlocked = useCallback(
    (slug: string, chapterNumber: number) => state.unlockedChapters.includes(`${slug}:${chapterNumber}`),
    [state.unlockedChapters]
  );

  const unlockChapter = useCallback(
    (slug: string, chapterNumber: number, cost: number) => {
      if (cost <= 0) return true; // free chapters always "succeed"
      const key = `${slug}:${chapterNumber}`;
      if (state.unlockedChapters.includes(key)) return true;
      if (state.coinBalance < cost) return false;

      const log: TransactionLog = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'unlock',
        amount: -cost,
        description: `Unlocked Chapter ${chapterNumber}`
      };

      persist({
        ...state,
        coinBalance: state.coinBalance - cost,
        totalSpent: state.totalSpent + cost,
        unlockedChapters: [...state.unlockedChapters, key],
        transactionLogs: [log, ...state.transactionLogs]
      });
      return true;
    },
    [state, persist]
  );

  const submitTopUp: CoinStoreShape['submitTopUp'] = useCallback(
    (data) => {
      const request: TopUpRequest = {
        id: `req-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'pending',
        ...data
      };
      persist({ ...state, topUpRequests: [request, ...state.topUpRequests] });
    },
    [state, persist]
  );

  const approveTopUp = useCallback(
    (id: string) => {
      const req = state.topUpRequests.find((r) => r.id === id);
      if (!req || req.status !== 'pending') return;

      const log: TransactionLog = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'topup',
        amount: req.packageCoins,
        description: `Top up — ${req.packageCoins} Coins`
      };

      persist({
        ...state,
        coinBalance: state.coinBalance + req.packageCoins,
        totalPurchased: state.totalPurchased + req.packageCoins,
        transactionLogs: [log, ...state.transactionLogs],
        topUpRequests: state.topUpRequests.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
      });
    },
    [state, persist]
  );

  const rejectTopUp = useCallback(
    (id: string) => {
      persist({
        ...state,
        topUpRequests: state.topUpRequests.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
      });
    },
    [state, persist]
  );

  return (
    <CoinContext.Provider
      value={{ ...state, ready, isChapterUnlocked, unlockChapter, submitTopUp, approveTopUp, rejectTopUp }}
    >
      {children}
    </CoinContext.Provider>
  );
}

export function useCoinStore() {
  const ctx = useContext(CoinContext);
  if (!ctx) throw new Error('useCoinStore must be used inside <CoinStoreProvider>');
  return ctx;
}
