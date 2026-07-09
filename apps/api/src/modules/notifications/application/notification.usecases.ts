import type { NotificationDto } from '@mnemonic/types';
import type { NotificationStore } from './notification-store.port.js';

export class ListNotificationsUseCase {
  constructor(private readonly store: NotificationStore) {}
  execute(userId: string, limit = 30): Promise<NotificationDto[]> {
    return this.store.list(userId, Math.min(Math.max(limit, 1), 100));
  }
}

export class GetUnreadCountUseCase {
  constructor(private readonly store: NotificationStore) {}
  execute(userId: string): Promise<number> {
    return this.store.unreadCount(userId);
  }
}

export class MarkNotificationReadUseCase {
  constructor(private readonly store: NotificationStore) {}
  execute(userId: string, id: string): Promise<void> {
    return this.store.markRead(userId, id);
  }
}

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly store: NotificationStore) {}
  execute(userId: string): Promise<void> {
    return this.store.markAllRead(userId);
  }
}
