import type {
  NotificationSender,
  OutboundNotification,
} from '../application/notification-sender.port.js';

/**
 * Resend email adapter (REST API, no SDK dependency). Active only when
 * RESEND_API_KEY is configured; used for email reminders (review-due, streaks).
 */
export class ResendEmailSender implements NotificationSender {
  constructor(private readonly options: { apiKey: string; from: string }) {}

  async sendEmail(notification: OutboundNotification): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.options.from,
        to: notification.to,
        subject: notification.title,
        text: notification.body,
      }),
    });
    if (!response.ok) {
      throw new Error(`Resend send failed: ${response.status}`);
    }
  }
}
