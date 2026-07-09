import type { NotificationDto } from '@mnemonic/types';
import type {
  CreateNotificationInput,
  NotificationStore,
} from '../application/notification-store.port.js';

interface MemNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
}

/** In-memory notification store for tests + the demo. */
export class InMemoryNotificationStore implements NotificationStore {
  private readonly items: MemNotification[] = [];

  seed(input: CreateNotificationInput & { readAt?: Date | null; createdAt?: Date }): void {
    this.items.push({
      id: input.id,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      readAt: input.readAt ?? null,
      createdAt: input.createdAt ?? new Date(),
    });
  }

  private toDto(n: MemNotification): NotificationDto {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    };
  }

  async list(userId: string, limit: number): Promise<NotificationDto[]> {
    return this.items
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((n) => this.toDto(n));
  }

  async unreadCount(userId: string): Promise<number> {
    return this.items.filter((n) => n.userId === userId && n.readAt === null).length;
  }

  async markRead(userId: string, id: string): Promise<void> {
    const found = this.items.find((n) => n.id === id && n.userId === userId);
    if (found && !found.readAt) found.readAt = new Date();
  }

  async markAllRead(userId: string): Promise<void> {
    const now = new Date();
    for (const n of this.items) {
      if (n.userId === userId && !n.readAt) n.readAt = now;
    }
  }

  async create(input: CreateNotificationInput): Promise<NotificationDto> {
    const record: MemNotification = { ...input, readAt: null, createdAt: new Date() };
    this.items.unshift(record);
    return this.toDto(record);
  }
}
