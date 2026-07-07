import { z } from 'zod';

/** Body schema for `POST /api/v1/analytics` (client event tracking). */
export const trackEventSchema = z.object({
  name: z.string().trim().min(1).max(100),
  sessionId: z.string().trim().max(100).optional(),
  properties: z.record(z.unknown()).optional(),
});
export type TrackEventDto = z.infer<typeof trackEventSchema>;
