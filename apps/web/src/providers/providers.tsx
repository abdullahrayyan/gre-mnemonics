'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';

// Valid-format fallback so the app builds/runs before Clerk is configured.
// Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY for real authentication.
const FALLBACK_CLERK_KEY = 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk';

export function Providers({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? FALLBACK_CLERK_KEY;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
