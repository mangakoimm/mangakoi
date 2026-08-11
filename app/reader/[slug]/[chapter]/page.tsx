import { notFound } from 'next/navigation';
import { getMangaBySlug, getChapters, getChapterPages } from '@/lib/supabase';
import { mockManga } from '@/lib/mockData';

// `params` is a Promise as of Next.js 15+ but a plain object in Next 14.
// Awaiting a plain object just resolves to itself, so this works on both.
type Params = Promise<{ slug: string; chapter: string }> | { slug: string; chapter: string };

export default async function ReaderPage({ params }: { params: Params }) {
  const { slug, chapter: chapterParam } = await params;

  let manga = await getMangaBySlug(slug);
  let isMock = false;

  if (!manga) {
    const mock = mockManga.find((m) => m.slug === slug);
    if (mock) {
      manga = mock;
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

  // Demo placeholder pages for mock manga (no real images uploaded yet).
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

  return (
    <main className="min-h-screen bg-[#0e0c0b] pb-16 pt-8 text-white">
      <div className="mx-auto max-w-[760px] px-4">
        <div className="mb-6 flex items-center justify-between">
          <a href={`/manga/${manga.slug}`} className="text-sm font-medium text-white/60 hover:text-white">
            ← {manga.title}
          </a>
          <h1 className="font-display text-lg font-bold">Chapter {chapter.number}</h1>
        </div>

        <div className="flex flex-col gap-1.5">
          {isMock
            ? pages.map((p) => (
                <div
                  key={p.id}
                  className="flex h-[560px] w-full flex-col items-center justify-center gap-2 rounded bg-gradient-to-br from-[#2a2320] to-[#1a1512] font-display font-bold text-white/25"
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  Page {p.page_number}
                </div>
              ))
            : pages.length === 0
              ? (
                  <p className="text-white/60">
                    No pages uploaded for this chapter yet. Add rows to the <code>pages</code> table with an
                    <code> image_url</code> pointing at a file in Supabase Storage.
                  </p>
                )
              : pages.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.image_url} alt={`Page ${p.page_number}`} className="w-full" loading="lazy" />
                ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          {prevChapter ? (
            <a href={`/reader/${manga.slug}/${prevChapter.number}`} className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold hover:bg-white/10">
              ← Previous
            </a>
          ) : (
            <span className="rounded-full border border-white/5 px-6 py-3 text-sm font-semibold text-white/30">← Previous</span>
          )}
          {nextChapter ? (
            <a href={`/reader/${manga.slug}/${nextChapter.number}`} className="rounded-full bg-gradient-to-br from-coral to-coral-deep px-6 py-3 text-sm font-semibold">
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
