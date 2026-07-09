export interface OutboundNotification {
  to: string;
  title: string;
  body: string;
}

/**
 * Port for delivering notifications over external channels (email via Resend,
 * push via FCM). The in-app channel is handled by the store; this is for
 * reminders. A no-op adapter is used in the demo / when unconfigured.
 */
export interface NotificationSender {
  sendEmail(notification: OutboundNotification): Promise<void>;
}
