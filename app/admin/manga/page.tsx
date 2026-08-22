'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabaseBrowser';
import { useToast } from '@/lib/toastStore';
import SupabaseNotConfigured from '@/components/SupabaseNotConfigured';

type MangaOption = { slug: string; title: string };
type GenreOption = { id: number; name: string };

export default function AdminMangaPage() {
  const { showToast } = useToast();
  const [mangaList, setMangaList] = useState<MangaOption[]>([]);
  const [genreList, setGenreList] = useState<GenreOption[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const configured = isSupabaseConfigured();

  const loadMangaList = useCallback(async () => {
    if (!configured) return;
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.from('manga').select('slug, title').order('title');
      if (!error && data) setMangaList(data);
    } catch (err) {
      console.error('Failed to load manga list:', err);
    }
  }, [configured]);

  useEffect(() => {
    if (!configured) {
      setLoadingList(false);
      return;
    }

    async function loadGenres() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.from('genres').select('id, name').order('name');
        if (!error && data) setGenreList(data);
      } catch (err) {
        console.error('Failed to load genres:', err);
      }
    }

    Promise.all([loadMangaList(), loadGenres()]).finally(() => setLoadingList(false));
  }, [configured, loadMangaList]);

  if (!configured) return <SupabaseNotConfigured />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-1 font-display text-lg font-bold">Manga & Chapters</h2>
        <p className="text-sm text-ink-soft dark:text-white/50">
          Create a manga, upload its cover, and add chapters — all from here, no Supabase dashboard needed.
        </p>
      </div>

      <CreateMangaForm
        genreList={genreList}
        onCreated={(msg) => {
          showToast(msg);
          loadMangaList();
        }}
      />

      {loadingList ? (
        <p className="text-sm text-ink-soft dark:text-white/50">Loading manga list…</p>
      ) : mangaList.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/10 p-6 text-sm text-ink-soft dark:border-white/10 dark:text-white/50">
          No manga yet — create one above, then come back down here to upload its cover and chapters.
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

function CreateMangaForm({ genreList, onCreated }: { genreList: GenreOption[]; onCreated: (msg: string) => void }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [artist, setArtist] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [releaseYear, setReleaseYear] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleGenre(id: number) {
    setSelectedGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  async function handleCreate() {
    if (!title || !slug) {
      setError('Title and slug are required.');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/create-manga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          author,
          artist,
          status,
          releaseYear,
          genreIds: selectedGenres
        })
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned an unexpected response (status ${res.status}). Check the terminal running "npm run dev" for the real error.`);
      }

      if (!res.ok) {
        setError(data.error ?? `Failed to create manga (status ${res.status}).`);
        return;
      }

      onCreated(`✅ "${title}" created.`);
      setTitle('');
      setSlug('');
      setSlugTouched(false);
      setDescription('');
      setAuthor('');
      setArtist('');
      setStatus('ongoing');
      setReleaseYear('');
      setSelectedGenres([]);
      setOpen(false);
    } catch (err: any) {
      setError(err.message ?? 'Network error — could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1f1a16]">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
        <h3 className="font-display text-base font-bold">➕ Create a new manga</h3>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>

      {open && (
        <div className="mt-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Title</span>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Crimson Ronin"
                className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">
                Slug (used in the URL)
              </span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                placeholder="crimson-ronin"
                className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Author</span>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Artist</span>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Release year</span>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="2024"
                className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              />
            </label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
            />
          </label>

          {genreList.length > 0 && (
            <div className="mt-3">
              <span className="mb-1.5 block text-xs font-semibold text-ink-soft dark:text-white/50">Genres</span>
              <div className="flex flex-wrap gap-2">
                {genreList.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      selectedGenres.includes(g.id)
                        ? 'border-coral bg-coral text-white'
                        : 'border-black/10 text-ink-soft dark:border-white/10 dark:text-white/50'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={saving}
            className="mt-4 rounded-full bg-gradient-to-br from-coral to-coral-deep px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            {saving ? 'Creating…' : 'Create manga'}
          </button>

          {error && <p className="mt-3 whitespace-pre-line text-sm font-medium text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}

function CoverUploadForm({ mangaList, onDone }: { mangaList: MangaOption[]; onDone: (msg: string) => void }) {
  const [slug, setSlug] = useState(mangaList[0]?.slug ?? '');
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!slug || (mode === 'file' && !file) || (mode === 'url' && !url)) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('slug', slug);
      if (mode === 'file') formData.append('file', file!);
      else formData.append('url', url);

      const res = await fetch('/api/admin/upload-cover', { method: 'POST', body: formData });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned an unexpected response (status ${res.status}). Check the terminal running "npm run dev" for the real error.`);
      }

      if (!res.ok) {
        setError(data.error ?? `Upload failed (status ${res.status}).`);
        return;
      }

      onDone('🖼️ Cover saved.');
      setFile(null);
      setPreview(null);
      setUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message ?? 'Network error — could not reach the server.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1f1a16]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Upload cover</h3>
        <div className="flex rounded-full border border-black/10 p-0.5 text-xs font-semibold dark:border-white/10">
          <button
            onClick={() => setMode('file')}
            className={`rounded-full px-3 py-1.5 ${mode === 'file' ? 'bg-coral text-white' : 'text-ink-soft dark:text-white/50'}`}
          >
            Upload file
          </button>
          <button
            onClick={() => setMode('url')}
            className={`rounded-full px-3 py-1.5 ${mode === 'url' ? 'bg-coral text-white' : 'text-ink-soft dark:text-white/50'}`}
          >
            Paste web URL
          </button>
        </div>
      </div>

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

        {mode === 'file' ? (
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
        ) : (
          <label className="flex-1">
            <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">Image URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
            />
          </label>
        )}

        {preview && mode === 'file' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="h-16 w-16 flex-shrink-0 rounded object-cover" />
        )}

        <button
          onClick={handleUpload}
          disabled={(mode === 'file' ? !file : !url) || uploading}
          className="rounded-full bg-gradient-to-br from-coral to-coral-deep px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40"
        >
          {uploading ? 'Saving…' : 'Save'}
        </button>
      </div>
      {error && <p className="mt-3 whitespace-pre-line text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}

function ChapterUploadForm({ mangaList, onDone }: { mangaList: MangaOption[]; onDone: (msg: string) => void }) {
  const [slug, setSlug] = useState(mangaList[0]?.slug ?? '');
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [coinCost, setCoinCost] = useState('0');
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [pageUrls, setPageUrls] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const urlList = pageUrls.split('\n').map((u) => u.trim()).filter(Boolean);
    if (!slug || !number || (mode === 'file' ? files.length === 0 : urlList.length === 0)) {
      setError('Manga, chapter number, and at least one page (file or URL) are all required.');
      return;
    }
    setUploading(true);
    setError(null);
    setProgress(mode === 'file' ? `Uploading ${files.length} page(s)…` : 'Saving page links…');

    try {
      const formData = new FormData();
      formData.append('slug', slug);
      formData.append('number', number);
      formData.append('title', title);
      formData.append('coinCost', coinCost);
      if (mode === 'file') files.forEach((f) => formData.append('pages', f));
      else formData.append('pageUrls', urlList.join('\n'));

      const res = await fetch('/api/admin/upload-chapter', { method: 'POST', body: formData });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned an unexpected response (status ${res.status}). Check the terminal running "npm run dev" for the real error.`);
      }

      if (!res.ok) {
        setError(data.error ?? `Upload failed (status ${res.status}).`);
        return;
      }

      onDone(`📖 Chapter ${number} saved — ${data.pageCount} page(s).`);
      setNumber('');
      setTitle('');
      setCoinCost('0');
      setFiles([]);
      setPageUrls('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message ?? 'Network error — could not reach the server.');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1f1a16]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Add a chapter</h3>
        <div className="flex rounded-full border border-black/10 p-0.5 text-xs font-semibold dark:border-white/10">
          <button
            onClick={() => setMode('file')}
            className={`rounded-full px-3 py-1.5 ${mode === 'file' ? 'bg-coral text-white' : 'text-ink-soft dark:text-white/50'}`}
          >
            Upload files
          </button>
          <button
            onClick={() => setMode('url')}
            className={`rounded-full px-3 py-1.5 ${mode === 'url' ? 'bg-coral text-white' : 'text-ink-soft dark:text-white/50'}`}
          >
            Paste web URLs
          </button>
        </div>
      </div>

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

      {mode === 'file' ? (
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
          {files.length > 0 && (
            <p className="mt-1.5 text-xs text-ink-soft dark:text-white/40">{files.length} file(s) selected</p>
          )}
        </label>
      ) : (
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-ink-soft dark:text-white/50">
            Page image URLs — one per line, in reading order
          </span>
          <textarea
            value={pageUrls}
            onChange={(e) => setPageUrls(e.target.value)}
            rows={5}
            placeholder={'https://example.com/page-1.jpg\nhttps://example.com/page-2.jpg'}
            className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
          />
        </label>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-4 rounded-full bg-gradient-to-br from-coral to-coral-deep px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40"
      >
        {uploading ? progress ?? 'Saving…' : 'Save chapter'}
      </button>

      {error && <p className="mt-3 whitespace-pre-line text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}
