import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { SiteHeader } from '@/components/site-header';
import { Providers } from '@/providers/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mnemonic Master AI',
  description:
    'Remember English words forever with AI-generated Hinglish mnemonics, spaced repetition, quizzes, and an AI tutor. Built for GRE and beyond.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Mnemonic Master',
  appleWebApp: { capable: true, title: 'Mnemonic', statusBarStyle: 'black-translucent' },
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
          <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
