import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Providers } from '@/providers/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mnemonic Master AI',
  description:
    'Remember English words forever with AI-generated Hinglish mnemonics, spaced repetition, quizzes, and an AI tutor. Built for GRE and beyond.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
