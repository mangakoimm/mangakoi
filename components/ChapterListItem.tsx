'use client';

import { useRouter } from 'next/navigation';
import { useCoinStore } from '@/lib/coinStore';
import { useUnlockFlow } from './UnlockDialog';

type ChapterLite = { id: string; number: number; title: string | null; published_at: string };

export default function ChapterListItem({
  mangaSlug,
  chapter,
  cost
}: {
  mangaSlug: string;
  chapter: ChapterLite;
  cost: number;
}) {
  const router = useRouter();
  const { isChapterUnlocked } = useCoinStore();
  const { requestUnlock, dialogNode } = useUnlockFlow(mangaSlug);

  const unlocked = cost === 0 || isChapterUnlocked(mangaSlug, chapter.number);
  const href = `/reader/${mangaSlug}/${chapter.number}`;

  function handleClick() {
    if (unlocked) {
      router.push(href);
    } else {
      requestUnlock(chapter.number, cost, () => {
        console.log('[DEBUG] navigating to', href);
        router.push(href);
      });
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium hover:bg-blush-soft dark:hover:bg-white/5"
      >
        <span className="flex items-center gap-2">
          {!unlocked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C3A38" strokeWidth="2" className="flex-shrink-0">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          )}
          Chapter {chapter.number}
          {chapter.title ? ` — ${chapter.title}` : ''}
        </span>
        <span className="flex items-center gap-3 text-ink-soft dark:text-white/50">
          {!unlocked && <span className="font-bold text-gold">🪙 {cost}</span>}
          {new Date(chapter.published_at).toLocaleDateString()}
        </span>
      </button>
      {dialogNode}
    </>
  );
}
