import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { SiteHeader } from '@/components/site-header';
import { Providers } from '@/providers/providers';
import './globals.css';

const SITE_URL = 'https://gremnemonics.netlify.app';
const TITLE = 'GRE Words — 1,111 curated words with memory hooks';
const DESCRIPTION =
  'Learn 1,111 GRE vocabulary words, each with a memory hook and a Hindi meaning. Study in groups of 25, then revise. Free, no sign-up, works offline.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  manifest: '/manifest.webmanifest',
  applicationName: 'GRE Words',
  appleWebApp: { capable: true, title: 'GRE Words', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'GRE Words',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-3xl px-4 py-8">{children}</main>
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
