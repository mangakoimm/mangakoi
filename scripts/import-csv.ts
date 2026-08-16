// Run with: npm run import-csv
// Reads data/manga.csv, data/chapters.csv, data/pages.csv and upserts them
// into Supabase. Image URLs in the CSVs point to images already hosted
// somewhere on the web — this script never uploads a file, so it works even
// if you haven't set up Storage buckets (npm run setup-storage) at all.
//
// Edit the CSVs (or replace them entirely) with your real data, then run
// this. Safe to re-run — matching rows are updated, not duplicated.

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'node:fs';
import path from 'node:path';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function readCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(process.cwd(), 'data', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`(skipping — data/${filename} not found)`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

async function importManga() {
  const rows = readCsv('manga.csv');
  for (const row of rows) {
    const { error } = await supabase.from('manga').upsert(
      {
        slug: row.slug,
        title: row.title,
        description: row.description || null,
        author: row.author || null,
        artist: row.artist || null,
        cover_url: row.cover_url || null,
        status: row.status || 'ongoing',
        release_year: row.release_year ? Number(row.release_year) : null
      },
      { onConflict: 'slug' }
    );
    console.log(error ? `✗ manga "${row.slug}": ${error.message}` : `✓ manga "${row.slug}"`);
  }
}

async function importChapters() {
  const rows = readCsv('chapters.csv');
  for (const row of rows) {
    const { data: manga } = await supabase.from('manga').select('id').eq('slug', row.manga_slug).single();
    if (!manga) {
      console.log(`✗ chapter "${row.manga_slug} #${row.number}": no manga with that slug (add it to manga.csv first)`);
      continue;
    }
    const { error } = await supabase.from('chapters').upsert(
      {
        manga_id: manga.id,
        number: Number(row.number),
        title: row.title || null,
        coin_cost: row.coin_cost ? Number(row.coin_cost) : 0
      },
      { onConflict: 'manga_id,number' }
    );
    console.log(error ? `✗ chapter "${row.manga_slug} #${row.number}": ${error.message}` : `✓ chapter "${row.manga_slug} #${row.number}"`);
  }
}

async function importPages() {
  const rows = readCsv('pages.csv');
  const clearedChapters = new Set<string>();
  let count = 0;

  for (const row of rows) {
    const { data: manga } = await supabase.from('manga').select('id').eq('slug', row.manga_slug).single();
    if (!manga) {
      console.log(`✗ page skipped: no manga "${row.manga_slug}"`);
      continue;
    }
    const { data: chapter } = await supabase
      .from('chapters')
      .select('id')
      .eq('manga_id', manga.id)
      .eq('number', Number(row.chapter_number))
      .single();
    if (!chapter) {
      console.log(`✗ page skipped: no chapter "${row.manga_slug} #${row.chapter_number}" (add it to chapters.csv first)`);
      continue;
    }

    const chapterKey = `${row.manga_slug}:${row.chapter_number}`;
    if (!clearedChapters.has(chapterKey)) {
      // Clear old pages for this chapter so re-running the import doesn't duplicate pages.
      await supabase.from('pages').delete().eq('chapter_id', chapter.id);
      clearedChapters.add(chapterKey);
    }

    const { error } = await supabase.from('pages').insert({
      chapter_id: chapter.id,
      page_number: Number(row.page_number),
      image_url: row.image_url
    });

    if (error) console.log(`✗ page "${row.manga_slug} #${row.chapter_number} p${row.page_number}": ${error.message}`);
    else count++;
  }
  console.log(`✓ ${count} page row(s) imported across ${clearedChapters.size} chapter(s)`);
}

async function main() {
  console.log('Importing manga...');
  await importManga();
  console.log('\nImporting chapters...');
  await importChapters();
  console.log('\nImporting pages...');
  await importPages();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Import failed:', err.message ?? err);
  process.exit(1);
});