import Link from 'next/link';

const links = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Top Up Requests', href: '/admin/requests' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Coin Logs', href: '/admin/coin-logs' }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">Admin Panel</h1>
        <Link href="/" className="text-sm font-semibold text-coral-deep">
          ← Back to site
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-blush-soft hover:text-coral-ink dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </main>
  );
}
