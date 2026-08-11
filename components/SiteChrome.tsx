'use client';

import { usePathname } from 'next/navigation';
import Nav from './Nav';
import Footer from './Footer';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReader = pathname?.startsWith('/reader/');

  if (isReader) {
    // The reader page is intentionally distraction-free — no nav, no footer.
    return <>{children}</>;
  }

  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
