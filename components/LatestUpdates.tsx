'use client';

import { useState } from 'react';
import type { MockManga } from '@/lib/mockData';
import MangaCard from './MangaCard';

export default function LatestUpdates({ manga }: { manga: MockManga[] }) {
  const [visible, setVisible] = useState(8);
  const done = visible >= manga.length;

  return (
    <div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {manga.slice(0, visible).map((m) => (
          <MangaCard key={m.id} manga={m} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          disabled={done}
          onClick={() => setVisible((v) => v + 8)}
          className="rounded-full border border-black/[0.08] bg-white px-7 py-3.5 text-[15px] font-semibold disabled:opacity-50 hover:border-coral hover:text-coral-deep dark:border-white/10 dark:bg-white/5"
        >
          {done ? "You're all caught up" : 'Load more chapters'}
        </button>
      </div>
    </div>
  );
}
