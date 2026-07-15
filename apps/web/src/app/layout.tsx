import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { SiteHeader } from '@/components/site-header';
import { Providers } from '@/providers/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'GRE Words',
  description: 'Read 1,100+ GRE words with memory hooks, group by group, then revise them.',
  manifest: '/manifest.webmanifest',
  applicationName: 'GRE Words',
  appleWebApp: { capable: true, title: 'GRE Words', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
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
