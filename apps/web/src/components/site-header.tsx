'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@mnemonic/ui';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>Mnemonic Master</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/words"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 sm:block"
          >
            Words
          </Link>
          <Link
            href="/review"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 sm:block"
          >
            Review
          </Link>
          <Link
            href="/quiz"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 sm:block"
          >
            Quiz
          </Link>
          <Link
            href="/dashboard"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 sm:block"
          >
            Dashboard
          </Link>
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
