'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@/lib/auth';
import { Button } from '@mnemonic/ui';
import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NotificationBell } from './notification-bell';
import { ThemeToggle } from './theme-toggle';

function HeaderSearch() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        router.push(term.trim() ? `/search?q=${encodeURIComponent(term.trim())}` : '/search');
      }}
      className="hidden items-center lg:flex"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search words…"
          className="w-44 rounded-lg border border-slate-200 bg-white/60 py-1.5 pl-8 pr-3 text-sm outline-none focus:w-56 focus:ring-2 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
      </div>
    </form>
  );
}

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
            href="/tutor"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 sm:block"
          >
            Tutor
          </Link>
          <Link
            href="/practice"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:block"
          >
            Practice
          </Link>
          <Link
            href="/achievements"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 md:block"
          >
            Badges
          </Link>
          <Link
            href="/community"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 md:block"
          >
            Community
          </Link>
          <Link
            href="/pricing"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:block"
          >
            Pricing
          </Link>
          <SignedIn>
            <Link
              href="/admin"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:block"
            >
              Admin
            </Link>
          </SignedIn>
          <Link
            href="/dashboard"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 sm:block"
          >
            Dashboard
          </Link>
          <HeaderSearch />
          <SignedIn>
            <NotificationBell />
          </SignedIn>
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
