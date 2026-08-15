// Run once with: npm run setup-storage
// Creates the two Storage buckets the app needs — Supabase doesn't create
// these automatically from schema.sql, since buckets aren't a SQL concept.
// Safe to re-run; it skips buckets that already exist.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function ensureBucket(name: string) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (buckets?.some((b) => b.name === name)) {
    console.log(`✓ Bucket "${name}" already exists.`);
    return;
  }

  const { error } = await supabase.storage.createBucket(name, {
    public: true, // covers/pages need to be publicly viewable in the reader
    fileSizeLimit: '10MB'
  });
  if (error) throw error;
  console.log(`✓ Created bucket "${name}".`);
}

async function main() {
  await ensureBucket('covers');
  await ensureBucket('chapter-pages');
  console.log('\nStorage setup complete. You can now use /admin/manga to upload covers and chapters.');
}

main().catch((err) => {
  console.error('Storage setup failed:', err.message ?? err);
  process.exit(1);
});