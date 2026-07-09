'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { QueryProvider } from './query-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
