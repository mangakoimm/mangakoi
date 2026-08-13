// Placeholder monetization rule: the most recent chapters cost coins (an
// "early access" model), older chapters are free. In a real backend this
// would be a `coin_cost` column on the `chapters` table (see
// supabase/schema.sql) instead of being computed from position.

export const CHAPTER_UNLOCK_COST = 5;
export const LOCKED_RECENT_COUNT = 5;

export function getChapterCost(chapterNumber: number, totalChapters: number): number {
  const isRecent = chapterNumber > totalChapters - LOCKED_RECENT_COUNT;
  return isRecent ? CHAPTER_UNLOCK_COST : 0;
}