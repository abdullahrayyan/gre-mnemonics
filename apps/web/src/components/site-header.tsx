import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/60">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>GRE Words</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
