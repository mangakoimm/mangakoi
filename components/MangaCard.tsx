'use client';

import Link from 'next/link';
import type { MockManga } from '@/lib/mockData';
import { fmtViews } from '@/lib/mockData';
import { useClientStore } from '@/lib/clientStore';

const statusStyle: Record<string, string> = {
  ongoing: 'bg-coral/90',
  completed: 'bg-emerald-600/90',
  hiatus: 'bg-neutral-500/85'
};

export default function MangaCard({ manga }: { manga: MockManga }) {
  const { isBookmarked, toggleBookmark } = useClientStore();
  const bookmarked = isBookmarked(manga.slug);

  return (
    // This wrapper is a plain <div>, not a link — a <button> can't legally
    // live inside an <a> (invalid HTML), which broke hydration for this
    // whole card and everything after it on the page. The Link below is an
    // invisible full-card overlay instead, and the bookmark button is a
    // real sibling sitting on top of it with its own click handling.
    <div className="group relative overflow-hidden rounded-lg border border-black/[0.06] bg-white transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_18px_40px_-18px_rgba(233,107,107,0.45)] dark:border-white/10 dark:bg-[#1f1a16]">
      <Link href={`/manga/${manga.slug}`} className="absolute inset-0 z-[1]" aria-label={`Open ${manga.title}`} />

      <div className="relative h-[240px] overflow-hidden">
        {manga.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={manga.cover_url}
            alt={manga.title}
            className="pointer-events-none h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`pointer-events-none flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br p-4 text-center transition-transform duration-500 group-hover:scale-105 ${manga.cov}`}>
            <span className="text-3xl">{manga.icon}</span>
            <span className="font-display text-[15px] font-extrabold leading-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.25)]">
              {manga.title}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute left-2.5 right-2.5 top-2.5 z-[2] flex items-start justify-between">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm ${statusStyle[manga.status]}`}>
            {manga.status}
          </span>
          <button
            aria-label="Toggle bookmark"
            onClick={() => toggleBookmark(manga.slug)}
            className="pointer-events-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm transition-transform hover:scale-110 hover:bg-white"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={bookmarked ? '#E96B6B' : 'none'} stroke="#8C3A38" strokeWidth="2" strokeLinejoin="round">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
            </svg>
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 z-[2] translate-y-3.5 rounded-full bg-white/90 py-2 text-center text-[12.5px] font-bold text-coral-ink opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Quick read →
        </div>
      </div>

      <div className="pointer-events-none p-3.5">
        <p className="mb-1.5 line-clamp-1 text-[14.5px] font-bold">{manga.title}</p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {(manga.genres ?? []).slice(0, 2).map((g) => (
            <span key={g} className="rounded-full bg-blush-soft px-2 py-0.5 text-[10px] font-semibold text-coral-ink dark:bg-white/10 dark:text-blush">
              {g}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-[11.5px] font-medium text-ink-soft dark:text-white/50">
          <span className="flex items-center gap-1 font-bold text-gold">★ {manga.rating}</span>
          <span>{fmtViews(manga.views)} views</span>
        </div>
        <div className="mt-2 border-t border-dashed border-black/10 pt-2 text-[11.5px] text-ink-soft dark:border-white/10 dark:text-white/40">
          Ch. {manga.chapter} · updated recently
        </div>
      </div>
    </div>
  );
}
