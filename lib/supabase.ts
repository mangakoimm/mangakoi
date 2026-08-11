import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create a real client if both env vars are actually set. Without this
// guard, `createClient(undefined, undefined)` throws at *module load time*
// (before any function even runs), which crashes every single page the
// moment you `npm run dev` — even the ones using the mock/demo catalog.
// This way, the app runs immediately with demo data, and starts talking to
// your real database the moment .env.local is filled in.
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!supabase && typeof window === 'undefined') {
  // Only log once, server-side, so it doesn't spam the browser console.
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
};

export type Chapter = {
  id: string;
  manga_id: string;
  number: number;
  title: string | null;
  published_at: string;
};

export type Page = {
  id: string;
  chapter_id: string;
  page_number: number;
  image_url: string;
};

// Fetch a list of manga with their genre names attached.
// Returns [] instead of throwing so a missing database (or a hiccup) shows
// an empty/demo state, never a crashed page.
export async function getMangaList(limit = 24): Promise<Manga[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('manga')
      .select('*, manga_genres(genres(name))')
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map((m: any) => ({
      ...m,
      genres: (m.manga_genres ?? []).map((mg: any) => mg.genres?.name).filter(Boolean)
    }));
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
      .select('*, manga_genres(genres(name))')
      .eq('slug', slug)
      .single();

    if (error) throw error;

    return {
      ...data,
      genres: (data.manga_genres ?? []).map((mg: any) => mg.genres?.name).filter(Boolean)
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
