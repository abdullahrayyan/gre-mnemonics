import type { PrismaClient } from '@mnemonic/database';
import type { NotificationDto } from '@mnemonic/types';
import type {
  CreateNotificationInput,
  NotificationStore,
} from '../application/notification-store.port.js';

type Row = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

const toDto = (row: Row): NotificationDto => ({
  id: row.id,
  type: row.type,
  title: row.title,
  body: row.body,
  readAt: row.readAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
});

/** Prisma-backed notification store. */
export class PrismaNotificationStore implements NotificationStore {
  constructor(private readonly prisma: PrismaClient) {}

  async list(userId: string, limit: number): Promise<NotificationDto[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(toDto);
  }

  async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date(), status: 'READ' as never },
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date(), status: 'READ' as never },
    });
  }

  async create(input: CreateNotificationInput): Promise<NotificationDto> {
    const row = await this.prisma.notification.create({
      data: {
        id: input.id,
        userId: input.userId,
        type: input.type as never,
        title: input.title,
        body: input.body,
      },
    });
    return toDto(row);
  }
}
