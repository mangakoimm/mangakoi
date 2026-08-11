'use client';

import { useState } from 'react';
import { genres, genreEmoji, type MockManga } from '@/lib/mockData';
import MangaCard from './MangaCard';

export default function GenreExplorer({ manga }: { manga: MockManga[] }) {
  const [active, setActive] = useState<string>(genres[0]);
  const filtered = manga.filter((m) => m.genres?.includes(active)).slice(0, 8);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setActive(g)}
            className={`rounded-full border px-4.5 px-[18px] py-2 text-[13.5px] font-semibold transition-colors ${
              active === g
                ? 'border-transparent bg-gradient-to-br from-coral to-coral-deep text-white'
                : 'border-black/[0.08] bg-white text-ink-soft hover:border-coral hover:text-coral-deep dark:border-white/10 dark:bg-white/5'
            }`}
          >
            {genreEmoji[g]} {g}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((m) => (
          <MangaCard key={m.id} manga={m} />
        ))}
      </div>
    </div>
  );
}
