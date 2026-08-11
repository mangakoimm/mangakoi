import Link from 'next/link';
import type { MockManga } from '@/lib/mockData';

const sakuraPositions = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i * 1.7) % 10,
  duration: 9 + ((i * 3) % 6),
  size: 10 + ((i * 5) % 10)
}));

export default function Hero({ picks }: { picks: MockManga[] }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        {sakuraPositions.map((s, i) => (
          <div
            key={i}
            className="absolute animate-fall opacity-0"
            style={{ left: `${s.left}%`, top: '-20px', animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }}
          >
            <svg width={s.size} height={s.size} viewBox="0 0 20 20">
              <path d="M10 2c1 2 3 2 4 4-2 1-2 3-4 4-2-1-2-3-4-4 1-2 3-2 4-4Z" fill={i % 2 ? '#FFD8D8' : '#E96B6B'} />
            </svg>
          </div>
        ))}
        <svg className="absolute -right-36 -top-10 opacity-[0.14] dark:opacity-20" width="620" height="420" viewBox="0 0 620 420">
          <path d="M20 210C90 90 220 40 320 70C400 95 430 160 500 150" stroke="#E96B6B" strokeWidth="34" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-12 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-coral-ink">
            🎏 Trusted by 2.4M readers
          </span>
          <h1 className="mt-3.5 font-display text-[clamp(38px,5vw,60px)] font-extrabold leading-[1.05] tracking-tight">
            Every story finds
            <br /> its <em className="text-coral-deep not-italic">current</em>.
          </h1>
          <p className="mb-8 mt-5 max-w-[480px] text-[17.5px] leading-relaxed text-ink-soft dark:text-white/60">
            MangaKoi is a calm, fast place to read manga — trending chapters, distraction-free pages, and a shelf
            that remembers exactly where you left off.
          </p>

          <div className="flex max-w-[520px] items-center gap-2.5 rounded-full border-[1.5px] border-black/[0.08] bg-white py-2 pl-5 pr-2 shadow-[0_10px_30px_-14px_rgba(34,32,31,0.18)] focus-within:border-coral dark:border-white/10 dark:bg-white/5">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5B5654" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.6" y2="16.6" />
            </svg>
            <input
              type="text"
              placeholder="Search titles, authors, genres…"
              className="flex-1 border-none bg-transparent text-[15.5px] outline-none placeholder:text-ink-soft dark:text-white"
            />
            <button className="flex-shrink-0 rounded-full bg-gradient-to-br from-coral to-coral-deep px-5 py-3 text-[14.5px] font-semibold text-white">
              Search
            </button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href="#trending"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-coral to-coral-deep px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_40px_-18px_rgba(233,107,107,0.45)] transition-transform hover:-translate-y-0.5"
            >
              Read Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              href="#trending"
              className="rounded-full border border-black/[0.08] bg-white px-7 py-3.5 text-[15px] font-semibold hover:border-coral hover:text-coral-deep dark:border-white/10 dark:bg-white/5"
            >
              Browse trending
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-8">
            {[['38,000+', 'Titles in library'], ['140+', 'Chapters added daily'], ['4.9★', 'Reader satisfaction']].map(([n, l]) => (
              <div key={l}>
                <b className="block font-display text-2xl font-extrabold">{n}</b>
                <span className="text-xs font-medium text-ink-soft dark:text-white/50">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[420px] lg:order-none">
          {picks.map((m, idx) => {
            const positions = [
              'top-[2%] left-[6%] w-[150px]',
              'top-[36%] left-[42%] w-[170px] z-10',
              'bottom-[4%] left-[2%] w-[150px]',
              'top-[6%] right-0 w-[150px]',
              'bottom-0 right-[8%] w-[150px]'
            ];
            return (
              <Link
                key={m.id}
                href={`/manga/${m.slug}`}
                className={`absolute animate-floaty overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_22px_46px_-18px_rgba(34,32,31,0.28)] dark:border-white/10 dark:bg-[#241d19] ${positions[idx % positions.length]}`}
                style={{ animationDelay: `${idx * 1.1}s` }}
              >
                <div className={`flex h-[130px] flex-col items-center justify-center gap-1.5 bg-gradient-to-br ${m.cov}`}>
                  <span className="text-2xl">{m.icon}</span>
                </div>
                <div className="px-2.5 py-2 text-[11.5px] font-bold leading-tight">{m.title}</div>
                <div className="flex items-center gap-1 px-2.5 pb-2.5 text-[10.5px] font-bold text-gold">★ {m.rating}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
