'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type StoreShape = {
  bookmarks: string[]; // manga slugs
  history: string[]; // manga slugs, most recently viewed first
  toggleBookmark: (slug: string) => void;
  isBookmarked: (slug: string) => boolean;
  addHistory: (slug: string) => void;
  ready: boolean; // false until we've read localStorage once, to avoid a flash of empty state
};

const StoreContext = createContext<StoreShape | null>(null);

const BOOKMARKS_KEY = 'mangakoi:bookmarks';
const HISTORY_KEY = 'mangakoi:history';

export function ClientStoreProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Read whatever was saved from a previous visit. This only runs in the
  // browser (useEffect never runs during server rendering), so it's safe.
  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) ?? '[]');
      const h = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
      setBookmarks(Array.isArray(b) ? b : []);
      setHistory(Array.isArray(h) ? h : []);
    } catch {
      // Corrupt or missing localStorage data — just start fresh.
    }
    setReady(true);
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev];
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const addHistory = useCallback((slug: string) => {
    setHistory((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 50);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isBookmarked = useCallback((slug: string) => bookmarks.includes(slug), [bookmarks]);

  return (
    <StoreContext.Provider value={{ bookmarks, history, toggleBookmark, isBookmarked, addHistory, ready }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useClientStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useClientStore must be used inside <ClientStoreProvider>');
  return ctx;
}
