'use client';

import type { NotificationDto } from '@mnemonic/types';
import { Button, Card, Skeleton, cn } from '@mnemonic/ui';
import { SignedIn, SignedOut, SignInButton } from '@/lib/auth';
import { useMarkAllRead, useNotifications } from '@/hooks/use-notifications';

const ICON: Record<string, string> = {
  ACHIEVEMENT: '🏅',
  REVIEW_DUE: '⏰',
  COMMUNITY: '💬',
  STREAK_REMINDER: '🔥',
  DAILY_GOAL: '🎯',
  SYSTEM: '🔔',
};

function Row({ notification }: { notification: NotificationDto }) {
  const unread = notification.readAt === null;
  return (
    <Card className={cn('flex gap-3', unread && 'border-indigo-200 dark:border-indigo-500/30')}>
      <span className="text-xl">{ICON[notification.type] ?? '🔔'}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {notification.title}
          {unread ? <span className="ml-2 inline-block h-2 w-2 rounded-full bg-indigo-500" /> : null}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{notification.body}</p>
      </div>
    </Card>
  );
}

function Inbox() {
  const notifications = useNotifications();
  const markAll = useMarkAllRead();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={markAll.isPending}
          onClick={() => markAll.mutate()}
        >
          Mark all read
        </Button>
      </div>
      {notifications.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : notifications.data?.data.length === 0 ? (
        <p className="py-10 text-center text-slate-400">You’re all caught up. 🎉</p>
      ) : (
        <div className="space-y-3">
          {notifications.data?.data.map((notification) => (
            <Row key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      <SignedOut>
        <Card className="space-y-4 text-center">
          <p>Sign in to see your notifications.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        <Inbox />
      </SignedIn>
    </div>
  );
}
