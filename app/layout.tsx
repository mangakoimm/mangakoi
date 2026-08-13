import type { Metadata } from 'next';
import { Poppins, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import SiteChrome from '@/components/SiteChrome';
import { ClientStoreProvider } from '@/lib/clientStore';
import { CoinStoreProvider } from '@/lib/coinStore';
import { ToastProvider } from '@/lib/toastStore';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins'
});

const noto = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto'
});

export const metadata: Metadata = {
  title: 'MangaKoi — Read manga in one breath',
  description: 'A calm, fast place to read manga.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${noto.variable}`}>
      <body className="bg-paper text-ink font-body">
        <ToastProvider>
          <ClientStoreProvider>
            <CoinStoreProvider>
              <SiteChrome>{children}</SiteChrome>
            </CoinStoreProvider>
          </ClientStoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
