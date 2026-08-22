import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const slug = formData.get('slug') as string | null;
    const numberStr = formData.get('number') as string | null;
    const title = (formData.get('title') as string) || null;
    const coinCostStr = (formData.get('coinCost') as string) || '0';

    if (!slug || !numberStr) {
      return NextResponse.json({ error: 'Missing manga slug or chapter number.' }, { status: 400 });
    }

    const number = Number(numberStr);
    const coinCost = Number(coinCostStr) || 0;
    if (!Number.isFinite(number)) {
      return NextResponse.json({ error: 'Chapter number must be a number.' }, { status: 400 });
    }

    const files = formData.getAll('pages') as File[];
    const pageUrlsRaw = (formData.get('pageUrls') as string) || '';
    const pageUrls = pageUrlsRaw
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    if (files.length === 0 && pageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Add either page image files or pasted image URLs (one per line).' },
        { status: 400 }
      );
    }

    if (pageUrls.some((u) => !/^https?:\/\//i.test(u))) {
      return NextResponse.json({ error: 'Every pasted image URL must start with http:// or https://' }, { status: 400 });
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

    const pageRows: { chapter_id: string; page_number: number; image_url: string }[] = [];

    if (pageUrls.length > 0) {
      // Just point at images that are already hosted somewhere else — no
      // upload, no Storage bucket required at all.
      pageUrls.forEach((url, i) => {
        pageRows.push({ chapter_id: chapter.id, page_number: i + 1, image_url: url });
      });
    } else {
      // Upload every page image in parallel instead of one-at-a-time. This
      // is faster for large batches, and — more importantly — means one bad
      // file doesn't just silently kill the whole request with a vague
      // error; we find out exactly which file(s) failed and why.
      const results = await Promise.allSettled(
        files.map(async (file, i) => {
          const ext = file.name.split('.').pop() || 'jpg';
          const path = `${slug}/${number}/${i + 1}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('chapter-pages')
            .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });

          if (uploadError) {
            throw new Error(`"${file.name}" (page ${i + 1}): ${uploadError.message}`);
          }

          const { data: publicUrlData } = supabase.storage.from('chapter-pages').getPublicUrl(path);
          return { chapter_id: chapter.id, page_number: i + 1, image_url: `${publicUrlData.publicUrl}?v=${Date.now()}` };
        })
      );

      const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
      const successes = results.filter((r): r is PromiseFulfilledResult<(typeof pageRows)[number]> => r.status === 'fulfilled');

      if (failures.length > 0) {
        failures.forEach((f) => console.error('upload-chapter page failed:', f.reason?.message ?? f.reason));
        return NextResponse.json(
          {
            error: `${failures.length} of ${files.length} page(s) failed to upload:\n${failures
              .map((f) => f.reason?.message ?? String(f.reason))
              .join('\n')}\n\nHave you run "npm run setup-storage"? Large batches can also hit your hosting provider's request size limit — if that's the case, try fewer files at a time, or paste image URLs instead.`
          },
          { status: 500 }
        );
      }

      successes.forEach((s) => pageRows.push(s.value));
      pageRows.sort((a, b) => a.page_number - b.page_number);
    }

    // Replace any existing pages for this chapter (handles re-uploads cleanly).
    await supabase.from('pages').delete().eq('chapter_id', chapter.id);
    const { error: pagesError } = await supabase.from('pages').insert(pageRows);

    if (pagesError) {
      return NextResponse.json({ error: `Images uploaded, but saving page rows failed: ${pagesError.message}` }, { status: 500 });
    }

    // Same reasoning as upload-cover — without this, the freshly uploaded
    // chapter/pages would be invisible until the cache naturally expires.
    revalidatePath('/');
    revalidatePath(`/manga/${slug}`);
    revalidatePath(`/reader/${slug}/${number}`);

    return NextResponse.json({ chapterId: chapter.id, pageCount: pageRows.length });
  } catch (err: any) {
    console.error('upload-chapter failed:', err);
    return NextResponse.json({ error: err.message ?? 'Unexpected upload error.' }, { status: 500 });
  }
}