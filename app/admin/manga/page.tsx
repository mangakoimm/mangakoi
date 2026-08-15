'use client';

import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabaseBrowser';
import { useToast } from '@/lib/toastStore';
import SupabaseNotConfigured from '@/components/SupabaseNotConfigured';

type MangaOption = { slug: string; title: string };

export default function AdminMangaPage() {
  const { showToast } = useToast();
  const [mangaList, setMangaList] = useState<MangaOption[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoadingList(false);
      return;
    }

    async function loadMangaList() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.from('manga').select('slug, title').order('title');
        if (!error && data) setMangaList(data);
      } catch (err) {
        console.error('Failed to load manga list:', err);
      } finally {
        setLoadingList(false);
      }
    }

    loadMangaList();
  }, [configured]);

  if (!configured) return <SupabaseNotConfigured />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-1 font-display text-lg font-bold">Manga & Chapters</h2>
        <p className="text-sm text-ink-soft dark:text-white/50">
          Upload a cover image or add a chapter with its page images. New manga entries themselves are still
          created via the Supabase Table Editor — this page just handles the images.
        </p>
      </div>

      {loadingList ? (
        <p className="text-sm text-ink-soft dark:text-white/50">Loading manga list…</p>
      ) : mangaList.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/10 p-6 text-sm text-ink-soft dark:border-white/10 dark:text-white/50">
          No manga found yet. Add one first via Supabase Table Editor → <code>manga</code> table, then come back
          here to upload its cover and chapters.
        </p>
      ) : (
        <>
          <CoverUploadForm mangaList={mangaList} onDone={(msg) => showToast(msg)} />
          <ChapterUploadForm mangaList={mangaList} onDone={(msg) => showToast(msg)} />
        </>
      )}
    </div>
  );
}

function CoverUploadForm({ mangaList, onDone }: { mangaList: MangaOption[]; onDone: (msg: string) => void }) {
  const [slug, setSlug] = useState(mangaList[0]?.slug ?? '');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!slug || !file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('slug', slug);
    formData.append('file', file);

    const res = await fetch('/api/admin/upload-cover', { method: 'POST', body: formData });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? 'Upload failed.');
      return;
    }

    onDone('🖼️ Cover uploaded.');
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1f1a16]">
      <h3 className="mb-4 font-display text-base font-bold">Upload cover</h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Manga</span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
          >
            {mangaList.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex-1">
          <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Cover image</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          />
        </label>

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="h-16 w-16 flex-shrink-0 rounded object-cover" />
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="rounded-full bg-gradient-to-br from-coral to-coral-deep px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}

function ChapterUploadForm({ mangaList, onDone }: { mangaList: MangaOption[]; onDone: (msg: string) => void }) {
  const [slug, setSlug] = useState(mangaList[0]?.slug ?? '');
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [coinCost, setCoinCost] = useState('0');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!slug || !number || files.length === 0) {
      setError('Manga, chapter number, and at least one page image are all required.');
      return;
    }
    setUploading(true);
    setError(null);
    setProgress(`Uploading ${files.length} page(s)…`);

    const formData = new FormData();
    formData.append('slug', slug);
    formData.append('number', number);
    formData.append('title', title);
    formData.append('coinCost', coinCost);
    files.forEach((f) => formData.append('pages', f));

    const res = await fetch('/api/admin/upload-chapter', { method: 'POST', body: formData });
    const data = await res.json();

    setUploading(false);
    setProgress(null);

    if (!res.ok) {
      setError(data.error ?? 'Upload failed.');
      return;
    }

    onDone(`📖 Chapter ${number} saved — ${data.pageCount} page(s).`);
    setNumber('');
    setTitle('');
    setCoinCost('0');
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1f1a16]">
      <h3 className="mb-4 font-display text-base font-bold">Add a chapter</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Manga</span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
          >
            {mangaList.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Chapter number</span>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. 12"
            className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Chapter title (optional)</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Return"
            className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Coin cost (0 = free)</span>
          <input
            type="number"
            value={coinCost}
            onChange={(e) => setCoinCost(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">
          Page images (select all pages for this chapter, in reading order)
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
        />
      </label>
      {files.length > 0 && (
        <p className="mt-1.5 text-xs text-ink-soft dark:text-white/40">{files.length} file(s) selected</p>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-4 rounded-full bg-gradient-to-br from-coral to-coral-deep px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40"
      >
        {uploading ? progress ?? 'Uploading…' : 'Save chapter'}
      </button>

      {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}
