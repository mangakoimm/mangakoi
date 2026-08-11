import type { Manga } from './supabase';

const genreList = ['Romance', 'Action', 'Horror', 'Comedy', 'Fantasy', 'Isekai'] as const;
export const genreEmoji: Record<string, string> = {
  Romance: '❤️', Action: '⚔️', Horror: '👻', Comedy: '😂', Fantasy: '🏴', Isekai: '🌌'
};
const titleWords1 = ['Crimson', 'Silent', 'Midnight', 'Azure', 'Wandering', 'Forgotten', 'Iron', 'Sakura', 'Eternal', 'Shadow', 'Golden', 'Broken', 'Hollow', 'Scarlet', 'Moonlit'];
const titleWords2 = ['Blade', 'Blossom', 'Kingdom', 'Requiem', 'Wolf', 'Empire', 'Heart', 'Oath', 'Tide', 'Garden', 'Throne', 'Ronin', 'Star', 'Echo', 'Wardens'];
const covClasses = ['from-coral to-coral-deep', 'from-violet-500 to-indigo-700', 'from-neutral-700 to-neutral-900', 'from-amber-400 to-coral', 'from-teal-500 to-teal-800', 'from-pink-500 to-fuchsia-800', 'from-sky-500 to-blue-700', 'from-lime-500 to-green-700'];

function seedRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

export type MockManga = Manga & { cov: string; icon: string; chapter: number };

function makeManga(i: number): MockManga {
  const rnd = seedRandom(i * 17 + 3);
  const g1 = genreList[Math.floor(rnd() * genreList.length)];
  let g2 = genreList[Math.floor(rnd() * genreList.length)];
  if (g2 === g1) g2 = genreList[(genreList.indexOf(g1) + 1) % genreList.length];
  const status = (['ongoing', 'ongoing', 'ongoing', 'completed', 'hiatus'] as const)[Math.floor(rnd() * 5)];
  const title = `${titleWords1[Math.floor(rnd() * titleWords1.length)]} ${titleWords2[Math.floor(rnd() * titleWords2.length)]}`;
  const rating = Number((3.6 + rnd() * 1.35).toFixed(1));
  const views = Math.floor(80 + rnd() * 4200); // in thousands; fmtViews formats this as K/M
  const chapter = Math.floor(8 + rnd() * 240);

  return {
    id: `mock-${i}`,
    slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${i}`,
    title,
    description: `A ${g1.toLowerCase()} story with unexpected ${g2.toLowerCase()} turns.`,
    author: null,
    artist: null,
    cover_url: null,
    status,
    release_year: 2018 + Math.floor(rnd() * 8),
    rating,
    views,
    genres: [g1, g2],
    cov: covClasses[Math.floor(rnd() * covClasses.length)],
    icon: genreEmoji[g1],
    chapter
  } as MockManga;
}

export const mockManga: MockManga[] = Array.from({ length: 40 }, (_, i) => makeManga(i + 1));
export const genres = genreList;

// v is already in thousands (e.g. 4200 means 4.2M reads)
export function fmtViews(v: number) {
  return v >= 1000 ? (v / 1000).toFixed(1) + 'M' : v + 'K';
}
