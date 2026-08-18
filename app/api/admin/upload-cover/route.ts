import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const slug = formData.get('slug') as string | null;
    const file = formData.get('file') as File | null;
    const webUrl = (formData.get('url') as string | null)?.trim() || null;

    if (!slug || (!file && !webUrl)) {
      return NextResponse.json({ error: 'Missing manga slug, and either a file or an image URL.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    let coverUrl: string;

    if (webUrl) {
      // Just point at the image wherever it already lives — no upload needed.
      if (!/^https?:\/\//i.test(webUrl)) {
        return NextResponse.json({ error: 'Image URL must start with http:// or https://' }, { status: 400 });
      }
      coverUrl = webUrl;
    } else {
      const ext = file!.name.split('.').pop() || 'jpg';
      const path = `${slug}/cover.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(path, file!, { upsert: true, contentType: file!.type });

      if (uploadError) {
        // The most common cause here is the bucket not existing yet.
        return NextResponse.json(
          { error: `Upload failed: ${uploadError.message}. Have you run "npm run setup-storage"? If you don't want to deal with Storage at all, paste an image URL instead.` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage.from('covers').getPublicUrl(path);
      // Cache-bust so the new cover shows immediately instead of a stale cached image.
      coverUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
    }

    const { error: updateError } = await supabase.from('manga').update({ cover_url: coverUrl }).eq('slug', slug);

    if (updateError) {
      return NextResponse.json({ error: `Failed to save to manga row: ${updateError.message}` }, { status: 500 });
    }

    // Without this, the home page and this manga's detail page would keep
    // serving their cached version (up to 60s old, or longer in production)
    // even though the database already has the new cover — which is exactly
    // why an upload can "succeed" but not visibly show up anywhere.
    revalidatePath('/');
    revalidatePath(`/manga/${slug}`);

    return NextResponse.json({ url: coverUrl });
  } catch (err: any) {
    console.error('upload-cover failed:', err);
    return NextResponse.json({ error: err.message ?? 'Unexpected upload error.' }, { status: 500 });
  }
}