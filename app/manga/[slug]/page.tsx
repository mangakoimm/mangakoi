import { notFound } from 'next/navigation';
import { getMangaBySlug, getChapters } from '@/lib/supabase';
import { mockManga } from '@/lib/mockData';
import { getChapterCost } from '@/lib/coinRules';
import TrackHistory from '@/components/TrackHistory';
import ChapterListItem from '@/components/ChapterListItem';

export const revalidate = 60;

// `params` is a Promise as of Next.js 15+ but a plain object in Next 14.
// Awaiting a plain object just resolves to itself, so this works on both.
type Params = Promise<{ slug: string }> | { slug: string };

export default async function MangaPage({ params }: { params: Params }) {
  const { slug } = await params;

  let manga = await getMangaBySlug(slug);
  let isMock = false;

  // Fall back to the demo catalog so cards on the homepage stay clickable
  // before you've added real manga to the database.
  if (!manga) {
    const mock = mockManga.find((m) => m.slug === slug);
    if (mock) {
      manga = mock;
      isMock = true;
    }
  }
  if (!manga) notFound();

  const chapters = isMock
    ? Array.from({ length: (manga as any).chapter }, (_, i) => ({
        id: `mock-ch-${i + 1}`,
        manga_id: manga!.id,
        number: (manga as any).chapter - i,
        title: null,
        published_at: new Date().toISOString()
      }))
    : await getChapters(manga.id);

  return (
    <main className="mx-auto max-w-[900px] px-8 py-14">
      <TrackHistory slug={manga.slug} />
      <h1 className="mb-2 font-display text-3xl font-extrabold">{manga.title}</h1>
      <p className="mb-1 text-sm font-semibold text-gold">★ {manga.rating}</p>
      <p className="mb-8 text-ink-soft">{manga.description}</p>

      <h2 className="mb-4 font-display text-xl font-bold">Chapters</h2>
      <div className="divide-y divide-black/5 rounded-lg border border-black/5 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#1f1a16]">
        {chapters.length === 0 && <p className="p-4 text-ink-soft">No chapters published yet.</p>}
        {chapters.map((c) => (
          <ChapterListItem
            key={c.id}
            mangaSlug={manga!.slug}
            chapter={c}
            cost={getChapterCost(c.number, chapters.length)}
          />
        ))}
      </div>
    </main>
  );
}
