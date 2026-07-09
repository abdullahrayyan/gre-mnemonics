import type { NotificationSender } from '../application/notification-sender.port.js';

/** No-op sender for the demo / when no email provider is configured. */
export class NoopNotificationSender implements NotificationSender {
  async sendEmail(): Promise<void> {
    // Intentionally does nothing.
  }
}
