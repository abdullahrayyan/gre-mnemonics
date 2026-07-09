'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useUnreadCount } from '@/hooks/use-notifications';

/** Header bell linking to the inbox, with an unread-count badge. */
export function NotificationBell() {
  const unread = useUnreadCount();
  const count = unread.data?.data.count ?? 0;
  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
    >
      <Bell className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  );
}
