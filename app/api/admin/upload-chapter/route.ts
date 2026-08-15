import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const slug = formData.get('slug') as string | null;
    const numberStr = formData.get('number') as string | null;
    const title = (formData.get('title') as string) || null;
    const coinCostStr = (formData.get('coinCost') as string) || '0';
    const files = formData.getAll('pages') as File[];

    if (!slug || !numberStr || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing manga slug, chapter number, or page images.' },
        { status: 400 }
      );
    }

    const number = Number(numberStr);
    const coinCost = Number(coinCostStr) || 0;
    if (!Number.isFinite(number)) {
      return NextResponse.json({ error: 'Chapter number must be a number.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: manga, error: mangaError } = await supabase
      .from('manga')
      .select('id')
      .eq('slug', slug)
      .single();

    if (mangaError || !manga) {
      return NextResponse.json({ error: `No manga found with slug "${slug}".` }, { status: 404 });
    }

    // Create (or update, if this chapter number already exists) the chapter row.
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .upsert({ manga_id: manga.id, number, title, coin_cost: coinCost }, { onConflict: 'manga_id,number' })
      .select()
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json({ error: chapterError?.message ?? 'Failed to create chapter.' }, { status: 500 });
    }

    // Upload every page image, in the order they were submitted.
    const pageRows: { chapter_id: string; page_number: number; image_url: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${slug}/${number}/${i + 1}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('chapter-pages')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        return NextResponse.json(
          { error: `Failed uploading page ${i + 1}: ${uploadError.message}. Have you run "npm run setup-storage"?` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage.from('chapter-pages').getPublicUrl(path);
      pageRows.push({
        chapter_id: chapter.id,
        page_number: i + 1,
        image_url: `${publicUrlData.publicUrl}?v=${Date.now()}`
      });
    }

    // Replace any existing pages for this chapter (handles re-uploads cleanly).
    await supabase.from('pages').delete().eq('chapter_id', chapter.id);
    const { error: pagesError } = await supabase.from('pages').insert(pageRows);

    if (pagesError) {
      return NextResponse.json({ error: `Images uploaded, but saving page rows failed: ${pagesError.message}` }, { status: 500 });
    }

    return NextResponse.json({ chapterId: chapter.id, pageCount: pageRows.length });
  } catch (err: any) {
    console.error('upload-chapter failed:', err);
    return NextResponse.json({ error: err.message ?? 'Unexpected upload error.' }, { status: 500 });
  }
}