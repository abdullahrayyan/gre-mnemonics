import type { Request, Response } from 'express';
import type {
  GetUnreadCountUseCase,
  ListNotificationsUseCase,
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
} from '../application/notification.usecases.js';

export class NotificationsController {
  constructor(
    private readonly listUseCase: ListNotificationsUseCase,
    private readonly unreadUseCase: GetUnreadCountUseCase,
    private readonly markReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllUseCase: MarkAllNotificationsReadUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: await this.listUseCase.execute(req.auth!.userId) });
  };

  unreadCount = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: { count: await this.unreadUseCase.execute(req.auth!.userId) } });
  };

  markRead = async (req: Request, res: Response): Promise<void> => {
    await this.markReadUseCase.execute(req.auth!.userId, req.params.id ?? '');
    res.status(200).json({ data: { id: req.params.id } });
  };

  markAll = async (req: Request, res: Response): Promise<void> => {
    await this.markAllUseCase.execute(req.auth!.userId);
    res.status(200).json({ data: { ok: true } });
  };
}
