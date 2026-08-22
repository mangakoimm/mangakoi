import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!supabase && typeof window === 'undefined') {
  console.warn(
    '[MangaKoi] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — ' +
      'showing the demo catalog. Copy .env.example to .env.local and add your Supabase keys to use real data.'
  );
}

export type Manga = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author: string | null;
  artist: string | null;
  cover_url: string | null;
  status: 'ongoing' | 'completed' | 'hiatus';
  release_year: number | null;
  rating: number;
  views: number;
  genres?: string[];
  latestChapter?: number; // highest chapter number that actually exists, from the chapters table
  chapterCount?: number;
};

export type Chapter = {
  id: string;
  manga_id: string;
  number: number;
  title: string | null;
  published_at: string;
  coin_cost?: number;
};

export type Page = {
  id: string;
  chapter_id: string;
  page_number: number;
  image_url: string;
};

// Fetch a list of manga with their genre names attached, plus the real
// latest-chapter number (was previously hardcoded to 1 everywhere real
// manga were shown — this is what actually fixes the "Ch. 1 · updated
// recently" label never changing after you add new chapters).
export async function getMangaList(limit = 24): Promise<Manga[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('manga')
      .select('*, manga_genres(genres(name)), chapters(number)')
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map((m: any) => {
      const chapterNumbers: number[] = (m.chapters ?? []).map((c: any) => c.number);
      return {
        ...m,
        genres: (m.manga_genres ?? []).map((mg: any) => mg.genres?.name).filter(Boolean),
        latestChapter: chapterNumbers.length ? Math.max(...chapterNumbers) : 0,
        chapterCount: chapterNumbers.length
      };
    });
  } catch (err) {
    console.error('getMangaList failed:', err);
    return [];
  }
}

export async function getMangaBySlug(slug: string): Promise<Manga | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('manga')
      .select('*, manga_genres(genres(name)), chapters(number)')
      .eq('slug', slug)
      .single();

    if (error) throw error;

    const chapterNumbers: number[] = (data.chapters ?? []).map((c: any) => c.number);
    return {
      ...data,
      genres: (data.manga_genres ?? []).map((mg: any) => mg.genres?.name).filter(Boolean),
      latestChapter: chapterNumbers.length ? Math.max(...chapterNumbers) : 0,
      chapterCount: chapterNumbers.length
    };
  } catch (err) {
    console.error('getMangaBySlug failed:', err);
    return null;
  }
}

export async function getChapters(mangaId: string): Promise<Chapter[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('manga_id', mangaId)
      .order('number', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('getChapters failed:', err);
    return [];
  }
}

export async function getChapterPages(chapterId: string): Promise<Page[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('page_number', { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('getChapterPages failed:', err);
    return [];
  }
}