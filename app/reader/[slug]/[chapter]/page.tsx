import { notFound } from 'next/navigation';
import { getMangaBySlug, getChapters, getChapterPages } from '@/lib/supabase';
import { mockManga } from '@/lib/mockData';
import { getChapterCost } from '@/lib/coinRules';
import ReaderGate from '@/components/ReaderGate';
import ReaderViewer from '@/components/ReaderViewer';

type Params = Promise<{ slug: string; chapter: string }> | { slug: string; chapter: string };

export default async function ReaderPage({ params }: { params: Params }) {
  const { slug, chapter: chapterParam } = await params;

  let manga = await getMangaBySlug(slug);
  let isMock = false;

  if (!manga) {
    const mock = mockManga.find((m) => m.slug === slug);
    if (mock) {
      manga = mock as any;
      isMock = true;
    }
  }
  if (!manga) notFound();

  const chapterNum = Number(chapterParam);

  const chapters = isMock
    ? Array.from({ length: (manga as any).chapter }, (_, i) => ({
        id: `mock-ch-${i + 1}`,
        manga_id: manga!.id,
        number: (manga as any).chapter - i,
        title: null,
        published_at: new Date().toISOString()
      }))
    : await getChapters(manga.id);

  const chapter = chapters.find((c) => c.number === chapterNum);
  if (!chapter) notFound();

  const pages = isMock
    ? Array.from({ length: 10 }, (_, i) => ({
        id: `mock-pg-${i + 1}`,
        chapter_id: chapter.id,
        page_number: i + 1,
        image_url: ''
      }))
    : await getChapterPages(chapter.id);

  const prevChapter = chapters.find((c) => c.number === chapterNum - 1);
  const nextChapter = chapters.find((c) => c.number === chapterNum + 1);
  const cost = getChapterCost(chapter.number, chapters.length);

  return (
    <main className="min-h-screen bg-[#0e0c0b] pb-16 pt-8 text-white">
      <div className="mx-auto max-w-[760px] px-4">
        <div className="mb-6 flex items-center justify-between">
          <a href={`/manga/${manga.slug}`} className="text-sm font-medium text-white/60 hover:text-white">
            ← {manga.title}
          </a>
          <h1 className="font-display text-lg font-bold">Chapter {chapter.number}</h1>
        </div>

        <ReaderGate mangaSlug={manga.slug} chapterNumber={chapter.number} cost={cost}>
          <ReaderViewer pages={pages} isMock={isMock} />
        </ReaderGate>

        <div className="mt-10 flex items-center justify-center gap-4">
          {prevChapter ? (
            <a
              href={`/reader/${manga.slug}/${prevChapter.number}`}
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold hover:bg-white/10"
            >
              ← Previous
            </a>
          ) : (
            <span className="rounded-full border border-white/5 px-6 py-3 text-sm font-semibold text-white/30">← Previous</span>
          )}
          {nextChapter ? (
            <a
              href={`/reader/${manga.slug}/${nextChapter.number}`}
              className="rounded-full bg-gradient-to-br from-coral to-coral-deep px-6 py-3 text-sm font-semibold"
            >
              Next chapter →
            </a>
          ) : (
            <span className="rounded-full border border-white/5 px-6 py-3 text-sm font-semibold text-white/30">Next chapter →</span>
          )}
        </div>
      </div>
    </main>
  );
}
