import type { Metadata } from 'next';
import { Poppins, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import SiteChrome from '@/components/SiteChrome';
import { ClientStoreProvider } from '@/lib/clientStore';
import { CoinStoreProvider } from '@/lib/coinStore';
import { ToastProvider } from '@/lib/toastStore';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

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

async function getNavUser() {
  // If Supabase isn't configured yet, treat everyone as logged out instead
  // of crashing — same "demo mode" fallback used elsewhere in the app.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();

    return { email: user.email ?? '', username: profile?.username ?? null };
  } catch (err) {
    console.error('getNavUser failed:', err);
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getNavUser();

  return (
    <html lang="en" className={`${poppins.variable} ${noto.variable}`}>
      <body className="bg-paper text-ink font-body">
        <ToastProvider>
          <ClientStoreProvider>
            <CoinStoreProvider>
              <SiteChrome user={user}>{children}</SiteChrome>
            </CoinStoreProvider>
          </ClientStoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
