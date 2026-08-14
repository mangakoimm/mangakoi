'use client';

import Link from 'next/link';
import { useState } from 'react';
import CoinBadge from './CoinBadge';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Latest', href: '/#latest' },
  { label: 'Popular', href: '/#popular' },
  { label: 'Genres', href: '/#genres' },
  { label: 'Rankings', href: '/#rankings' },
  { label: 'Bookmarks', href: '/bookmarks' },
  { label: 'History', href: '/history' },
  { label: 'Community', href: '/community' }
];

type NavUser = { email: string; username: string | null } | null;

export default function Nav({ user }: { user: NavUser }) {
  const [dark, setDark] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }

  const initials = user ? (user.username || user.email).slice(0, 2).toUpperCase() : null;

  return (
    <>
      <nav className="sticky top-0 z-50 flex h-[76px] items-center border-b border-black/[0.06] bg-white/60 backdrop-blur-xl transition-colors dark:border-white/[0.08] dark:bg-[#17130f]/60">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-6 sm:px-8">
          <Link href="/" className="flex flex-shrink-0 items-center gap-2.5 font-display text-xl font-extrabold tracking-tight">
            <svg width="34" height="34" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path d="M12 34C12 22 22 13 34 13C43 13 50 18 53 26L58 22" stroke="#E96B6B" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M34 13C30 8 24 6 19 8" stroke="#E96B6B" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M14 34c0 8 5 15 13 17-3 3-4 7-3 11 4-1 7-4 8-8" stroke="#E96B6B" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M53 26c3 3 3 8 0 11" stroke="#E96B6B" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span>
              Manga<span className="text-coral">Koi</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {links.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-[14.5px] font-medium text-ink-soft transition-colors hover:bg-blush-soft hover:text-coral-ink dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-shrink-0 items-center gap-2.5">
            {user && <CoinBadge className="hidden sm:flex" />}
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-black/[0.06] bg-white text-ink-soft transition-colors hover:border-coral hover:text-coral-deep dark:border-white/10 dark:bg-white/5 dark:text-white/70"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-black/[0.06] bg-white text-ink-soft xl:hidden dark:border-white/10 dark:bg-white/5 dark:text-white/70"
            >
              ☰
            </button>

            {user ? (
              <Link
                href="/profile"
                aria-label="Your profile"
                className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-coral to-gold text-sm font-bold text-white shadow-[0_4px_12px_rgba(233,107,107,0.35)] transition-transform hover:scale-105"
              >
                {initials}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden flex-shrink-0 rounded-full bg-gradient-to-br from-coral to-coral-deep px-5 py-2.5 text-sm font-semibold text-white sm:flex"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-[400] xl:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[78%] max-w-[320px] flex-col gap-1 bg-white p-6 shadow-2xl dark:bg-[#1f1a16]">
            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl px-2.5 py-3.5 text-[15.5px] font-semibold hover:bg-blush-soft hover:text-coral-ink dark:hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-2.5 py-3.5 text-[15.5px] font-semibold hover:bg-blush-soft hover:text-coral-ink dark:hover:bg-white/10"
                >
                  Profile
                </Link>
                <Link
                  href="/topup"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-2.5 py-3.5 text-[15.5px] font-semibold hover:bg-blush-soft hover:text-coral-ink dark:hover:bg-white/10"
                >
                  🪙 Top Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-2.5 py-3.5 text-[15.5px] font-semibold hover:bg-blush-soft hover:text-coral-ink dark:hover:bg-white/10"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-2.5 py-3.5 text-[15.5px] font-semibold hover:bg-blush-soft hover:text-coral-ink dark:hover:bg-white/10"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
