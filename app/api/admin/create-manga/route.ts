import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, author, artist, status, releaseYear, genreIds } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must be lowercase letters, numbers, and hyphens only (e.g. "my-manga-title").' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: manga, error } = await supabase
      .from('manga')
      .insert({
        title,
        slug,
        description: description || null,
        author: author || null,
        artist: artist || null,
        status: status || 'ongoing',
        release_year: releaseYear ? Number(releaseYear) : null
      })
      .select()
      .single();

    if (error) {
      const friendly = error.code === '23505' ? `A manga with slug "${slug}" already exists.` : error.message;
      return NextResponse.json({ error: friendly }, { status: 400 });
    }

    if (Array.isArray(genreIds) && genreIds.length > 0) {
      const { error: genreError } = await supabase
        .from('manga_genres')
        .insert(genreIds.map((genre_id: number) => ({ manga_id: manga.id, genre_id })));
      if (genreError) console.error('Failed to link genres:', genreError.message);
    }

    revalidatePath('/');

    return NextResponse.json({ manga });
  } catch (err: any) {
    console.error('create-manga failed:', err);
    return NextResponse.json({ error: err.message ?? 'Unexpected error creating manga.' }, { status: 500 });
  }
}