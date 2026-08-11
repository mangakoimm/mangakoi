import Link from 'next/link';

export default function Footer() {
  return (
    <>
      <section className="mx-auto max-w-[1320px] px-6 pb-4 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-7 rounded-xl bg-gradient-to-br from-coral to-coral-deep p-9 text-white sm:flex-row sm:p-11">
          <div>
            <h3 className="mb-2 font-display text-2xl font-extrabold">Never miss a chapter drop</h3>
            <p className="max-w-[400px] text-[14.5px] opacity-90">
              One email a week — new arrivals, staff picks, and a few things we just liked reading.
            </p>
          </div>
          <form className="flex flex-shrink-0 gap-2 rounded-full bg-white/15 p-1.5">
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-[220px] border-none bg-transparent px-4 py-2.5 text-white outline-none placeholder:text-white/70"
            />
            <button type="submit" className="rounded-full bg-white px-5.5 px-[22px] py-2.5 text-[13.5px] font-bold text-coral-deep">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <footer className="mt-16 border-t border-black/[0.06] bg-white pt-14 dark:border-white/10 dark:bg-[#1f1a16]">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
          <div className="grid grid-cols-1 gap-9 pb-10 sm:grid-cols-2 md:grid-cols-5">
            <div>
              <div className="mb-3.5 flex items-center gap-2 font-display text-lg font-extrabold">
                <svg width="30" height="30" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path d="M12 34C12 22 22 13 34 13C43 13 50 18 53 26L58 22" stroke="#E96B6B" strokeWidth="3.4" strokeLinecap="round" />
                </svg>
                MangaKoi
              </div>
              <p className="mb-4.5 mb-[18px] max-w-[280px] text-sm leading-relaxed text-ink-soft dark:text-white/50">
                A calmer way to read manga online — curated shelves, a fast reader, and a community that shows up
                for release day.
              </p>
            </div>
            <FooterCol title="Explore" links={['Trending', 'Latest', 'Genres', 'Rankings']} />
            <FooterCol title="Account" links={['Dashboard', 'Bookmarks', 'History', 'Settings']} />
            <FooterCol title="Company" links={['About', 'Contact', 'FAQ']} />
            <FooterCol title="Legal" links={['DMCA', 'Privacy policy', 'Terms of service']} />
          </div>
          <div className="flex flex-col items-center justify-between gap-3.5 border-t border-black/[0.06] py-5.5 py-[22px] text-[13px] text-ink-soft dark:border-white/10 dark:text-white/50 sm:flex-row">
            <span>© {new Date().getFullYear()} MangaKoi. Illustrated covers shown are original, not scans.</span>
            <div className="flex gap-4.5 gap-[18px]">
              <Link href="/">Privacy</Link>
              <Link href="/">Terms</Link>
              <Link href="/">DMCA</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h5 className="mb-4 text-[12.5px] font-bold uppercase tracking-wide text-ink-soft dark:text-white/40">{title}</h5>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l}>
            <Link href="/" className="text-sm font-medium hover:text-coral-deep">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
