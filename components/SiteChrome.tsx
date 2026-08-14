'use client';

import { usePathname } from 'next/navigation';
import Nav from './Nav';
import Footer from './Footer';

type NavUser = { email: string; username: string | null } | null;

export default function SiteChrome({ children, user }: { children: React.ReactNode; user: NavUser }) {
  const pathname = usePathname();
  const isReader = pathname?.startsWith('/reader/');

  if (isReader) {
    // The reader page is intentionally distraction-free — no nav, no footer.
    return <>{children}</>;
  }

  return (
    <>
      <Nav user={user} />
      {children}
      <Footer />
    </>
  );
}
