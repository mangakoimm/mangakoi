import { getMangaList } from '@/lib/supabase';
import { mockManga, type MockManga } from '@/lib/mockData';
import MangaCard from '@/components/MangaCard';
import Hero from '@/components/Hero';
import GenreExplorer from '@/components/GenreExplorer';
import LatestUpdates from '@/components/LatestUpdates';
import FAQ from '@/components/FAQ';

export const revalidate = 60;

function SectionHead({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold sm:text-[28px]">
          {emoji} {title}
        </h2>
        <p className="mt-1.5 text-[14.5px] text-ink-soft dark:text-white/50">{subtitle}</p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const dbManga = await getMangaList(40);

  const usingMock = dbManga.length === 0;
  const catalog: MockManga[] = usingMock
    ? mockManga
    : (dbManga as any[]).map((m) => ({
        ...m,
        cov: 'from-coral to-coral-deep',
        icon: '📖',
        // Was hardcoded to 1 for every real manga regardless of how many
        // chapters it actually had — that's why "Ch. 1 · updated recently"
        // never changed after adding new chapters. Now uses the real
        // highest chapter number computed in getMangaList().
        chapter: m.latestChapter ?? 0
      }));

  const trending = catalog.slice(0, 12);
  const popular = [...catalog].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const topRated = [...catalog].sort((a, b) => b.rating - a.rating).slice(10, 18);
  const heroPicks = [catalog[2], catalog[8], catalog[15] ?? catalog[3], catalog[22] ?? catalog[4], catalog[5]].filter(Boolean);

  return (
    <main>
      {usingMock && (
        <div className="border-b border-black/[0.06] bg-blush-soft px-6 py-2.5 text-center text-[13px] font-medium text-coral-ink dark:border-white/10 dark:bg-white/5">
          Showing demo catalog — connect your Supabase database and add manga to replace this with real content.
        </div>
      )}

      <Hero picks={heroPicks} />

      <section id="trending" className="py-10">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
          <SectionHead emoji="🔥" title="Trending today" subtitle="What everyone on MangaKoi is reading right now." />
          <div className="flex gap-5 overflow-x-auto pb-5 pt-1.5">
            {trending.map((m) => (
              <div key={m.id} className="w-[216px] flex-shrink-0">
                <MangaCard manga={m} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="popular" className="py-10">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
          <SectionHead emoji="⭐" title="Most popular" subtitle="Reader favorites, ranked by bookmarks this month." />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {popular.map((m) => (
              <MangaCard key={m.id} manga={m} />
            ))}
          </div>
        </div>
      </section>

      <section id="genres" className="border-y border-black/[0.06] bg-white py-11 dark:border-white/10 dark:bg-[#1f1a16]">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
          <SectionHead emoji="" title="Browse by genre" subtitle="Six moods, one shelf." />
          <GenreExplorer manga={catalog} />
        </div>
      </section>

      <section id="latest" className="py-14">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
          <SectionHead emoji="🆕" title="Latest updates" subtitle="Fresh chapters, as they land." />
          <LatestUpdates manga={catalog.slice(20)} />
        </div>
      </section>

      <section id="rankings" className="py-10">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
          <SectionHead emoji="🏆" title="Top rated" subtitle="The highest scored titles on MangaKoi, all time." />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {topRated.map((m) => (
              <MangaCard key={m.id} manga={m} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
          <SectionHead emoji="" title="Frequently asked" subtitle="" />
          <FAQ />
        </div>
      </section>
    </main>
  );
}
