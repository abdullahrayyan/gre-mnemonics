export interface AnalyticsEventInput {
  name: string;
  userId?: string | null;
  sessionId?: string | null;
  properties?: Record<string, unknown>;
}

/** Port for recording product analytics events. */
export interface AnalyticsRecorder {
  record(input: AnalyticsEventInput): Promise<void>;
}
