// Run with: npm run seed
// Requires SUPABASE_SERVICE_ROLE_KEY (not the anon key) since it writes data.
// Get it from Supabase -> Project Settings -> API -> service_role key. Never expose this key in the browser.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: manga, error } = await supabase
    .from('manga')
    .insert({
      slug: 'moonlit-tide',
      title: 'Moonlit Tide',
      description: 'A fisherman discovers his village sits above a sleeping sea god.',
      status: 'ongoing',
      release_year: 2024,
      rating: 4.6
    })
    .select()
    .single();

  if (error) throw error;
  console.log('Created manga:', manga.title);

  const { data: chapter, error: chErr } = await supabase
    .from('chapters')
    .insert({ manga_id: manga.id, number: 1, title: 'The First Tide' })
    .select()
    .single();

  if (chErr) throw chErr;

  const { error: pgErr } = await supabase.from('pages').insert(
    Array.from({ length: 8 }, (_, i) => ({
      chapter_id: chapter.id,
      page_number: i + 1,
      // Replace with real URLs after uploading images to Supabase Storage.
      image_url: `https://your-project.supabase.co/storage/v1/object/public/chapter-pages/moonlit-tide/1/${i + 1}.jpg`
    }))
  );
  if (pgErr) throw pgErr;

  console.log('Seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
