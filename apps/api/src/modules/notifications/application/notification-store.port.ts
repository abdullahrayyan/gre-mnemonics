import type { NotificationDto } from '@mnemonic/types';

export interface CreateNotificationInput {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
}

/** Persistence port for in-app notifications. */
export interface NotificationStore {
  list(userId: string, limit: number): Promise<NotificationDto[]>;
  unreadCount(userId: string): Promise<number>;
  markRead(userId: string, id: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  create(input: CreateNotificationInput): Promise<NotificationDto>;
}
